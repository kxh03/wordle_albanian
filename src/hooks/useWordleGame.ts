import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, LetterState } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  postDictionaryValidate,
  postGamesSubmit,
  type ApiLanguage,
  type SubmitGuessResponse,
} from '@/lib/api';
import { normalizeForWordleMatch } from '@/utils/wordleNormalize';

const ROWS = 6;
const COLS = 5;

export type WordleGameOptions = {
  mode: 'local' | 'api';
  apiLanguage: ApiLanguage;
  targetToken?: string | null;
  validateGuess?: (guess: string) => Promise<boolean>;
};

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

export function useWordleGame(
  targetWord: string,
  gameId?: string,
  options?: WordleGameOptions
) {
  const { config } = useLanguage();
  const mode = options?.mode ?? 'local';
  const apiLanguage = options?.apiLanguage ?? 'sq';
  const targetToken = options?.targetToken ?? null;
  const validateGuess =
    options?.validateGuess ??
    ((g: string) => postDictionaryValidate(apiLanguage, g));

  const secretWordRef = useRef<string>('');
  const submittingRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const normalized = config.normalizeFunction(targetWord);
    secretWordRef.current = normalized;
    const storageKey = gameId;

    if (storageKey) {
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
      rowFeedback: mode === 'api' ? [] : undefined,
    };
  });

  const [isRevealing, setIsRevealing] = useState(false);
  const [isWordCompleteAnimating, setIsWordCompleteAnimating] = useState(false);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  const persist = useCallback(
    (state: GameState) => {
      if (!gameId) return;
      const stateToSave = {
        board: state.board,
        currentRow: state.currentRow,
        currentCol: state.currentCol,
        gameStatus: state.gameStatus,
        guesses: state.guesses,
        letterStates: Object.fromEntries(state.letterStates),
        rowFeedback: state.rowFeedback,
      };
      localStorage.setItem(gameId, JSON.stringify(stateToSave));
    },
    [gameId]
  );

  const triggerRevealAnimation = useCallback(() => {
    setIsRevealing(true);
    setTimeout(() => {
      setIsRevealing(false);
      setIsWordCompleteAnimating(true);
      setTimeout(() => setIsWordCompleteAnimating(false), 2500);
    }, 1500);
  });

  const applySubmitResponse = useCallback(
    (guess: string, data: SubmitGuessResponse) => {
      const feedback = mapApiRow(data.result);
      const isWin = data.is_win;
      const revealed = data.target_word;

      setGameState((prev) => {
        const row = prev.currentRow;
        const nextRowFeedback = [...(prev.rowFeedback || [])];
        nextRowFeedback[row] = feedback;

        const letterStates = mergeLetterStatesFromFeedback(
          prev.letterStates,
          guess,
          feedback
        );

        let gameStatus = prev.gameStatus;
        let currentRow = prev.currentRow;
        let currentCol = 0;
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

      triggerRevealAnimation();
      setInvalidReason(null);
    },
    [config, persist, triggerRevealAnimation]
  );

  const submitApiRow = useCallback(
    async (guess: string, rowIndex: number) => {
      if (!targetToken || submittingRef.current) return;
      submittingRef.current = true;
      setInvalidReason(null);
      try {
        const data = await postGamesSubmit({
          language: apiLanguage,
          guess,
          targetToken,
          isLastRow: rowIndex === ROWS - 1,
        });
        applySubmitResponse(guess, data);
      } catch (e: unknown) {
        const status = (e as { status?: number }).status;
        if (status === 422) {
          setInvalidReason('not_in_dictionary');
        } else {
          setInvalidReason('not_in_dictionary');
        }
      } finally {
        submittingRef.current = false;
      }
    },
    [targetToken, apiLanguage, applySubmitResponse]
  );

  const submitLocalRow = useCallback(
    async (currentGuess: string) => {
      const normalizedGuess = config.normalizeFunction(currentGuess);
      const target = secretWordRef.current;

      if (validateGuess) {
        const ok = await validateGuess(currentGuess);
        if (!ok) {
          setInvalidReason('not_in_dictionary');
          return;
        }
      }

      setGameState((prev) => {
        const nextGuesses = [...prev.guesses, normalizedGuess];
        let letterStates = new Map(prev.letterStates);
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
        let currentCol = 0;

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
      setInvalidReason(null);
    },
    [config, validateGuess, persist, triggerRevealAnimation]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState.gameStatus !== 'playing' || isRevealing) return;
      if (mode === 'api' && submittingRef.current) return;

      if (key === 'BACKSPACE' && invalidReason) {
        setInvalidReason(null);
      }

      if (key === 'ENTER' && mode === 'api') {
        if (gameState.currentCol !== COLS || !targetToken) return;
        const guess = gameState.board[gameState.currentRow].join('');
        void submitApiRow(guess, gameState.currentRow);
        return;
      }

      if (key === 'ENTER' && mode === 'local') {
        if (gameState.currentCol !== COLS) return;
        const currentGuess = gameState.board[gameState.currentRow].join('');
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
            const normalizedGuess = config.normalizeFunction(currentGuess);
            const target = secretWordRef.current;
            if (validateGuess) {
              void validateGuess(currentGuess).then((ok) => {
                setInvalidReason(ok ? null : 'not_in_dictionary');
              });
            } else {
              const isTargetMatch =
                normalizeForWordleMatch(currentGuess) === normalizeForWordleMatch(target);
              setInvalidReason(isTargetMatch ? null : 'not_in_dictionary');
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
      invalidReason,
      gameId,
      config,
      mode,
      targetToken,
      validateGuess,
      submitApiRow,
      submitLocalRow,
      persist,
    ]
  );

  useEffect(() => {
    const normalized = config.normalizeFunction(targetWord);
    secretWordRef.current = normalized;
  }, [targetWord, config]);

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
        rowFeedback: mode === 'api' ? [] : undefined,
      });
      setIsRevealing(false);
      setIsWordCompleteAnimating(false);
      setInvalidReason(null);
    },
    [targetWord, gameId, config, mode]
  );

  return {
    gameState,
    isRevealing,
    isWordCompleteAnimating,
    handleKeyPress,
    resetGame,
    invalidReason,
    getTargetWord: () => secretWordRef.current,
  };
}
