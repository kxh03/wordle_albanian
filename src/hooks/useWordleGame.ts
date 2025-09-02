import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, LetterState } from '@/types/game';
import { ensureDictionaryLoaded, isValidGuess } from '@/utils/dictionary';
import { useLanguage } from '@/contexts/LanguageContext';

const ROWS = 6;
const COLS = 5;

export function useWordleGame(targetWord: string, gameId?: string) {
  const { config } = useLanguage();
  
  // Kick off dictionary loading once per hook usage and when language changes
  useEffect(() => {
    ensureDictionaryLoaded(config.code, config.normalizeFunction);
  }, [config.code, config.normalizeFunction]);
  
  const secretWordRef = useRef<string>("");

  const [gameState, setGameState] = useState<GameState>(() => {
    const normalized = config.normalizeFunction(targetWord);
    secretWordRef.current = normalized;
    // Persist only when a gameId is provided (daily/friends). Free play should not persist.
    const storageKey = gameId;
    
    // Try to load saved game state (without target word for security) only for persistent games
    if (storageKey) {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Convert letterStates Map back from object
          const letterStates = new Map(Object.entries(parsed.letterStates || {}));
          // Restore state but always use the current target word (never from storage)
          return {
            ...parsed,
            letterStates,
            targetWord: normalized // Always use current target, never stored
          };
        } catch (e) {
          console.warn('Failed to parse saved game state');
        }
      }
    }
    
    return {
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing' as const,
      guesses: [],
      letterStates: new Map()
    };
  });

  const [isRevealing, setIsRevealing] = useState(false);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  const updateLetterStates = useCallback((guess: string, target: string) => {
    const newLetterStates = new Map(gameState.letterStates);
    const normalizedGuess = config.normalizeFunction(guess);
    const normalizedTarget = config.normalizeFunction(target);
    
    for (let i = 0; i < normalizedGuess.length; i++) {
      const letter = normalizedGuess[i];
      if (letter === normalizedTarget[i]) {
        newLetterStates.set(letter, 'correct');
      } else if (normalizedTarget.includes(letter) && newLetterStates.get(letter) !== 'correct') {
        newLetterStates.set(letter, 'partial');
      } else if (!normalizedTarget.includes(letter)) {
        newLetterStates.set(letter, 'incorrect');
      }
    }
    
    return newLetterStates;
  }, [gameState.letterStates]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || isRevealing) return;

    setGameState(prevState => {
      const newState = { ...prevState };
      
      if (key === 'BACKSPACE') {
        if (newState.currentCol > 0) {
          newState.currentCol--;
          newState.board[newState.currentRow][newState.currentCol] = '';
        }
      } else if (key === 'ENTER') {
        if (newState.currentCol === COLS) {
          const currentGuess = newState.board[newState.currentRow].join('');
          
          // Validation rules
          const normalizedGuess = config.normalizeFunction(currentGuess);
          const target = secretWordRef.current; // already normalized
          const isTargetMatch = normalizedGuess === target;
          const isDictionaryOk = isValidGuess(normalizedGuess, config.normalizeFunction);
          // Enforce dictionary in all modes: only allow words present in the active dictionary
          const isValid = normalizedGuess.length === COLS && (isTargetMatch || isDictionaryOk);

          if (isValid) {
            newState.guesses.push(normalizedGuess);
            
            // Update letter states
            newState.letterStates = updateLetterStates(normalizedGuess, target);
            
            // Check if won
            let allEqual = true;
            for (let i = 0; i < COLS; i++) {
              if (normalizedGuess[i] !== target[i]) { allEqual = false; break; }
            }
            if (allEqual) {
              newState.gameStatus = 'won';
            } else if (newState.currentRow === ROWS - 1) {
              newState.gameStatus = 'lost';
            } else {
              newState.currentRow++;
              newState.currentCol = 0;
            }
            
            // Trigger revealing animation
            setIsRevealing(true);
            setTimeout(() => setIsRevealing(false), 1500);
            setInvalidReason(null);
          } else {
            // Signal invalid guess so UI can inform the user
            setInvalidReason('not_in_dictionary');
          }
        }
      } else if (newState.currentCol < COLS && key.length === 1) {
        const normKey = config.normalizeFunction(key);
        newState.board[newState.currentRow][newState.currentCol] = normKey;
        newState.currentCol++;
      }
      
      // Save game state (excluding target word) only for persistent games
      if (gameId) {
        const stateToSave = {
          board: newState.board,
          currentRow: newState.currentRow,
          currentCol: newState.currentCol,
          gameStatus: newState.gameStatus,
          guesses: newState.guesses,
          // Never store the target word for security
          letterStates: Object.fromEntries(newState.letterStates)
        };
        localStorage.setItem(gameId, JSON.stringify(stateToSave));
      }
      
      return newState;
    });
  }, [gameState.gameStatus, gameState.letterStates, isRevealing, updateLetterStates, gameId]);

  const resetGame = useCallback((newTargetWord?: string) => {
    const normalized = config.normalizeFunction(newTargetWord || targetWord);
    
    // Clear saved state only for persistent games
    if (gameId) {
      localStorage.removeItem(gameId);
    }
    
    secretWordRef.current = normalized;

    setGameState({
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing',
      guesses: [],
      letterStates: new Map()
    });
    setIsRevealing(false);
  }, [targetWord, gameId]);

  return {
    gameState,
    isRevealing,
    handleKeyPress,
    resetGame,
    invalidReason,
    getTargetWord: () => secretWordRef.current
  };
}