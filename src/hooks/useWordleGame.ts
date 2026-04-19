import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GameState, LetterState } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  postDictionaryValidate,
  postGamesSubmit,
  type ApiLanguage,
  type SubmitGuessResponse,
} from '@/lib/api';
import { normalizeForWordleMatch } from '@/utils/wordleNormalize';
import {
  createEmptyHardModeHints,
  updateHardModeHints,
  validateGuessAgainstHardMode,
  type HardModeHints,
} from '@/utils/hardMode';

const ROWS = 6;
const COLS = 5;

export type ServerDailySnapshot = {
  guesses: { guess: string; result: ('correct' | 'partial' | 'incorrect')[] }[];
  answer: string | null;
  status: 'playing' | 'won' | 'lost';
};

/** Response shape from POST /api/daily/guess */
export type ServerGuessResponse = {
  result: ('correct' | 'partial' | 'incorrect')[];
  is_won: boolean;
  attempts_left: number;
  is_completed: boolean;
  target_word?: string;
};

export type WordleGameOptions = {
  mode: 'local' | 'api' | 'server-daily';
  apiLanguage: ApiLanguage;
  targetToken?: string | null;
  validateGuess?: (guess: string) => Promise<boolean>;
  /** Hydrate from GET /api/daily (authenticated). */
  serverSnapshot?: ServerDailySnapshot | null;
  /** Submit guess to Laravel (no target token on client). */
  serverSubmitGuess?: (guess: string, rowIndex: number) => Promise<ServerGuessResponse>;
  hardMode?: boolean;
  timedMode?: boolean;
  timeLimitSeconds?: number;
};

export type InvalidGuessReason =
  | { code: 'not_in_dictionary' }
  | { code: 'hard_mode_position'; letter: string; position: number }
  | { code: 'hard_mode_letter'; letter: string }
  | { code: 'must_use_revealed_hints' }
  | { code: 'time_up' };

function mergeLetterStatesFromFeedback(
  prev: Map<string, LetterState>,
  guess: string,
  feedback: LetterState[]
): Map<string, LetterState> {
  const next = new Map(prev);
  const rank: Record<LetterState, number> = {
    unused: -1,
    incorrect: 0,
    partial: 1,
    correct: 2,
  };
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const state = feedback[i];
    const old = next.get(letter) ?? 'unused';
    if (rank[state] >= rank[old]) {
      next.set(letter, state);
    }
  }
  return next;
}

function mapApiRow(result: SubmitGuessResponse['result']): LetterState[] {
  return result.map((r) => {
    if (r === 'correct' || r === 'partial' || r === 'incorrect') return r;
    return 'incorrect';
  });
}

function deriveHardModeHintsFromState(state: GameState): HardModeHints {
  const hints = createEmptyHardModeHints();
  if (!state.rowFeedback || state.rowFeedback.length === 0) return hints;

  for (let row = 0; row < state.guesses.length; row++) {
    const guess = state.guesses[row];
    const feedback = state.rowFeedback[row];
    if (guess && feedback) {
      const next = updateHardModeHints(hints, guess, feedback);
      hints.correctPositions = next.correctPositions;
      hints.requiredLetters = next.requiredLetters;
    }
  }
  return hints;
}

function buildInitialFromServerSnapshot(
  snapshot: ServerDailySnapshot,
  config: { normalizeFunction: (s: string) => string }
): GameState {
  if (snapshot.guesses.length === 0) {
    return {
      board: Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing',
      guesses: [],
      letterStates: new Map(),
      rowFeedback: [],
    };
  }

  const board = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(''));
  const rowFeedback: LetterState[][] = [];
  let letterStates = new Map<string, LetterState>();

  snapshot.guesses.forEach((g, rowIdx) => {
    const normGuess = config.normalizeFunction(g.guess);
    for (let i = 0; i < COLS; i++) {
      board[rowIdx][i] = normGuess[i] ?? '';
    }
    const feedback = mapApiRow(g.result);
    rowFeedback[rowIdx] = feedback;
    letterStates = mergeLetterStatesFromFeedback(letterStates, normGuess, feedback);
  });

  const guesses = snapshot.guesses.map((g) => config.normalizeFunction(g.guess));
  const gameStatus = snapshot.status;

  let currentRow: number;
  let currentCol: number;
  if (gameStatus === 'playing') {
    currentRow = Math.min(snapshot.guesses.length, ROWS - 1);
    if (snapshot.guesses.length < ROWS) {
      currentRow = snapshot.guesses.length;
      currentCol = 0;
    } else {
      currentRow = ROWS - 1;
      currentCol = COLS;
    }
  } else {
    currentRow = Math.max(0, snapshot.guesses.length - 1);
    currentCol = COLS;
  }

  return {
    board,
    currentRow,
    currentCol,
    gameStatus,
    guesses,
    letterStates,
    rowFeedback,
  };
}

export function useWordleGame(targetWord: string, gameId?: string, options?: WordleGameOptions) {
  const { config } = useLanguage();
  const mode = options?.mode ?? 'local';
  const apiLanguage = options?.apiLanguage ?? 'sq';
  const targetToken = options?.targetToken ?? null;
  const serverSubmitGuess = options?.serverSubmitGuess;
  const validateGuess = useMemo(
    () => options?.validateGuess ?? ((g: string) => postDictionaryValidate(apiLanguage, g)),
    [options?.validateGuess, apiLanguage]
  );
  const hardMode = options?.hardMode ?? false;
  const timedMode = options?.timedMode ?? false;
  const timeLimitSeconds = options?.timeLimitSeconds ?? 60;

  const secretWordRef = useRef<string>('');
  const submittingRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const normalized = config.normalizeFunction(targetWord);
    secretWordRef.current = normalized;
    const storageKey = gameId;

    if (mode === 'server-daily' && options?.serverSnapshot) {
      const st = buildInitialFromServerSnapshot(options.serverSnapshot, config);
      secretWordRef.current = options.serverSnapshot.answer
        ? config.normalizeFunction(options.serverSnapshot.answer)
        : normalized;
      return st;
    }

    if (storageKey && mode !== 'server-daily') {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          const letterStates = new Map(Object.entries(parsed.letterStates || {}));
          return {
            ...parsed,
            letterStates,
            rowFeedback: parsed.rowFeedback,
          };
        } catch {
          console.warn('Failed to parse saved game state');
        }
      }
    }

    return {
      board: Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing' as const,
      guesses: [],
      letterStates: new Map(),
      rowFeedback: mode === 'api' || mode === 'server-daily' ? [] : undefined,
    };
  });

  const [isRevealing, setIsRevealing] = useState(false);
  const [isWordCompleteAnimating, setIsWordCompleteAnimating] = useState(false);
  const [invalidReason, setInvalidReason] = useState<InvalidGuessReason | null>(null);
  const [hardModeHints, setHardModeHints] = useState<HardModeHints>(createEmptyHardModeHints);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimitSeconds);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const persist = useCallback(
    (state: GameState) => {
      if (!gameId || mode === 'server-daily') return;
      const stateToSave = {
        board: state.board,
        currentRow: state.currentRow,
        currentCol: state.currentCol,
        gameStatus: state.gameStatus,
        guesses: state.guesses,
        letterStates: Object.fromEntries(state.letterStates),
        rowFeedback: state.rowFeedback,
        hardModeHints: {
          correctPositions: hardModeHints.correctPositions,
          requiredLetters: [...hardModeHints.requiredLetters],
        },
      };
      localStorage.setItem(gameId, JSON.stringify(stateToSave));
    },
    [gameId, mode, hardModeHints]
  );

  const triggerRevealAnimation = useCallback(() => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
      setIsWordCompleteAnimating(true);
      setTimeout(() => setIsWordCompleteAnimating(false), 2500);
    }, 1500);
  }, []);

  const applySubmitResponse = useCallback(
    (guess: string, data: SubmitGuessResponse) => {
      const feedback = mapApiRow(data.result);
      const isWin = data.is_win;
      const revealed = data.target_word;

      setGameState((prev) => {
        const row = prev.currentRow;
        const nextRowFeedback = [...(prev.rowFeedback || [])];
        nextRowFeedback[row] = feedback;

        const letterStates = mergeLetterStatesFromFeedback(prev.letterStates, guess, feedback);

        let gameStatus = prev.gameStatus;
        let currentRow = prev.currentRow;
        const currentCol = 0;
        const guesses = [...prev.guesses, config.normalizeFunction(guess)];

        if (isWin) {
          gameStatus = 'won';
        } else if (row === ROWS - 1) {
          gameStatus = 'lost';
        } else {
          currentRow = row + 1;
        }

        if (revealed) {
          secretWordRef.current = config.normalizeFunction(revealed);
        }

        const next: GameState = {
          ...prev,
          guesses,
          letterStates,
          rowFeedback: nextRowFeedback,
          gameStatus,
          currentRow,
          currentCol,
        };
        persist(next);
        return next;
      });

      setHardModeHints((prev) => updateHardModeHints(prev, guess, feedback));

      triggerRevealAnimation();
      setInvalidReason(null);
    },
    [config, persist, triggerRevealAnimation]
  );

  const submitApiRow = useCallback(
    async (guess: string, rowIndex: number) => {
      if (submittingRef.current) return;
      if (mode === 'api' && !targetToken) return;
      if (mode === 'server-daily' && !serverSubmitGuess) return;
      submittingRef.current = true;
      setInvalidReason(null);
      try {
        let data: SubmitGuessResponse;
        if (mode === 'server-daily' && serverSubmitGuess) {
          const raw = await serverSubmitGuess(guess, rowIndex);
          data = {
            result: raw.result,
            is_win: raw.is_won,
            target_word: raw.target_word,
          };
        } else {
          data = await postGamesSubmit({
            language: apiLanguage,
            guess,
            targetToken: targetToken!,
            isLastRow: rowIndex === ROWS - 1,
            hardMode,
            correctPositions: hardModeHints.correctPositions,
            requiredLetters: [...hardModeHints.requiredLetters],
          });
        }
        applySubmitResponse(guess, data);
      } catch (e: unknown) {
        const status = (e as { status?: number }).status;
        const message = (e as { message?: string }).message || '';
        if (status === 422) {
          if (message.includes('position')) {
            setInvalidReason({ code: 'must_use_revealed_hints' });
          } else if (message.includes('contain letter')) {
            setInvalidReason({ code: 'must_use_revealed_hints' });
          } else {
            setInvalidReason({ code: 'not_in_dictionary' });
          }
        } else {
          setInvalidReason({ code: 'not_in_dictionary' });
        }
      } finally {
        submittingRef.current = false;
      }
    },
    [targetToken, apiLanguage, applySubmitResponse, mode, serverSubmitGuess, hardMode, hardModeHints]
  );

  const submitLocalRow = useCallback(
    async (currentGuess: string) => {
      const normalizedGuess = config.normalizeFunction(currentGuess);
      const target = secretWordRef.current;

      if (validateGuess) {
        const ok = await validateGuess(currentGuess);
        if (!ok) {
          setInvalidReason({ code: 'not_in_dictionary' });
          return;
        }
      }

      setGameState((prev) => {
        const nextGuesses = [...prev.guesses, normalizedGuess];
        const letterStates = new Map(prev.letterStates);
        const matchGuess = normalizeForWordleMatch(currentGuess);
        const matchTarget = normalizeForWordleMatch(target);
        for (let i = 0; i < matchGuess.length; i++) {
          const letter = normalizedGuess[i];
          if (matchGuess[i] === matchTarget[i]) {
            letterStates.set(letter, 'correct');
          } else if (
            matchTarget.includes(matchGuess[i]) &&
            letterStates.get(letter) !== 'correct'
          ) {
            letterStates.set(letter, 'partial');
          } else if (!matchTarget.includes(matchGuess[i])) {
            letterStates.set(letter, 'incorrect');
          }
        }

        let gameStatus = prev.gameStatus;
        let currentRow = prev.currentRow;
        const currentCol = 0;

        let allEqual = true;
        for (let i = 0; i < COLS; i++) {
          if (matchGuess[i] !== matchTarget[i]) {
            allEqual = false;
            break;
          }
        }
        if (allEqual) {
          gameStatus = 'won';
        } else if (prev.currentRow === ROWS - 1) {
          gameStatus = 'lost';
        } else {
          currentRow = prev.currentRow + 1;
        }

        const next: GameState = {
          ...prev,
          guesses: nextGuesses,
          letterStates,
          gameStatus,
          currentRow,
          currentCol,
        };
        persist(next);
        return next;
      });

      triggerRevealAnimation();
      setHardModeHints((prev) => {
        const normalizedTarget = normalizeForWordleMatch(target);
        const normalizedMatchGuess = normalizeForWordleMatch(normalizedGuess);
        const feedback = Array.from({ length: COLS }, (_, i) => {
          const mg = normalizedMatchGuess[i];
          const mt = normalizedTarget[i];
          if (mg === mt) return 'correct' as const;
          if (normalizedTarget.includes(mg)) return 'partial' as const;
          return 'incorrect' as const;
        });
        return updateHardModeHints(prev, normalizedGuess, feedback);
      });
      setInvalidReason(null);
    },
    [config, validateGuess, persist, triggerRevealAnimation]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState.gameStatus !== 'playing' || isRevealing) return;
      if (timedMode && isTimeUp) return;
      if ((mode === 'api' || mode === 'server-daily') && submittingRef.current) return;

      if (key === 'BACKSPACE' && invalidReason) {
        setInvalidReason(null);
      }

      if (key === 'ENTER' && (mode === 'api' || mode === 'server-daily')) {
        if (gameState.currentCol !== COLS) return;
        if (mode === 'api' && !targetToken) return;
        if (mode === 'server-daily' && !serverSubmitGuess) return;
        const guess = gameState.board[gameState.currentRow].join('');
        if (hardMode) {
          const hardError = validateGuessAgainstHardMode(guess, hardModeHints);
          if (hardError) {
            setInvalidReason(hardError);
            return;
          }
        }
        void submitApiRow(guess, gameState.currentRow);
        return;
      }

      if (key === 'ENTER' && mode === 'local') {
        if (gameState.currentCol !== COLS) return;
        const currentGuess = gameState.board[gameState.currentRow].join('');
        if (hardMode) {
          const hardError = validateGuessAgainstHardMode(currentGuess, hardModeHints);
          if (hardError) {
            setInvalidReason(hardError);
            return;
          }
        }
        void submitLocalRow(currentGuess);
        return;
      }

      setGameState((prevState) => {
        const newState = { ...prevState };

        if (key === 'BACKSPACE') {
          if (newState.currentCol > 0) {
            newState.currentCol--;
            newState.board[newState.currentRow][newState.currentCol] = '';
          }
        } else if (newState.currentCol < COLS && key.length === 1) {
          const normKey = config.normalizeFunction(key);
          newState.board[newState.currentRow][newState.currentCol] = normKey;
          newState.currentCol++;

          if (newState.currentCol === COLS) {
            const currentGuess = newState.board[newState.currentRow].join('');
            const target = secretWordRef.current;
            if (validateGuess) {
              void validateGuess(currentGuess).then((ok) => {
                setInvalidReason(ok ? null : { code: 'not_in_dictionary' });
              });
            } else {
              const isTargetMatch =
                normalizeForWordleMatch(currentGuess) === normalizeForWordleMatch(target);
              setInvalidReason(isTargetMatch ? null : { code: 'not_in_dictionary' });
            }
          } else if (invalidReason) {
            setInvalidReason(null);
          }
        }

        persist(newState);
        return newState;
      });
    },
    [
      gameState.gameStatus,
      gameState.currentCol,
      gameState.currentRow,
      gameState.board,
      isRevealing,
      isTimeUp,
      invalidReason,
      config,
      mode,
      targetToken,
      serverSubmitGuess,
      validateGuess,
      hardMode,
      hardModeHints,
      timedMode,
      submitApiRow,
      submitLocalRow,
      persist,
    ]
  );

  useEffect(() => {
    if (mode === 'server-daily') return;
    const normalized = config.normalizeFunction(targetWord);
    secretWordRef.current = normalized;
  }, [targetWord, config, mode]);

  useEffect(() => {
    setHardModeHints(deriveHardModeHintsFromState(gameState));
  }, [gameState]);

  useEffect(() => {
    if (!timedMode) {
      setIsTimeUp(false);
      setTimeLeft(timeLimitSeconds);
      return;
    }
    if (gameState.gameStatus !== 'playing') return;
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timedMode, gameState.gameStatus, timeLeft, timeLimitSeconds]);

  useEffect(() => {
    if (!timedMode) return;
    if (gameState.gameStatus !== 'playing') return;
    if (gameState.guesses.length > 0) return;
    setTimeLeft(timeLimitSeconds);
  }, [timedMode, timeLimitSeconds, gameState.gameStatus, gameState.guesses.length]);

  useEffect(() => {
    if (!timedMode || isTimeUp || gameState.gameStatus !== 'playing' || timeLeft > 0) return;
    setIsTimeUp(true);
    setInvalidReason({ code: 'time_up' });
    setGameState((prev) => {
      const next: GameState = { ...prev, gameStatus: 'lost' };
      persist(next);
      return next;
    });
    if (mode === 'api' && targetToken) {
      const revealGuess = gameState.board[gameState.currentRow].join('').padEnd(COLS, 'A').slice(0, COLS);
      void postGamesSubmit({
        language: apiLanguage,
        guess: revealGuess,
        targetToken,
        isLastRow: true,
        timeUp: true,
      }).then((data) => {
        if (data.target_word) {
          secretWordRef.current = config.normalizeFunction(data.target_word);
        }
      });
    }
  }, [
    timedMode,
    isTimeUp,
    gameState.gameStatus,
    timeLeft,
    mode,
    targetToken,
    apiLanguage,
    config,
    gameState.board,
    gameState.currentRow,
    persist,
  ]);

  const resetGame = useCallback(
    (newTargetWord?: string) => {
      const normalized = config.normalizeFunction(newTargetWord || targetWord);

      if (gameId) {
        localStorage.removeItem(gameId);
      }

      secretWordRef.current = normalized;

      setGameState({
        board: Array(ROWS)
          .fill(null)
          .map(() => Array(COLS).fill('')),
        currentRow: 0,
        currentCol: 0,
        gameStatus: 'playing',
        guesses: [],
        letterStates: new Map(),
        rowFeedback: mode === 'api' || mode === 'server-daily' ? [] : undefined,
      });
      setHardModeHints(createEmptyHardModeHints());
      setTimeLeft(timeLimitSeconds);
      setIsTimeUp(false);
      setIsRevealing(false);
      setIsWordCompleteAnimating(false);
      setInvalidReason(null);
    },
    [targetWord, gameId, config, mode, timeLimitSeconds]
  );

  return {
    gameState,
    isRevealing,
    isWordCompleteAnimating,
    handleKeyPress,
    resetGame,
    invalidReason,
    hardModeHints,
    timeLeft,
    isTimeUp,
    getTargetWord: () => secretWordRef.current,
  };
}
