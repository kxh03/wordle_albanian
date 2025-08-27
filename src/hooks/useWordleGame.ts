import { useState, useCallback } from 'react';
import { GameState, LetterState } from '@/types/game';
import { normalizeAlbanian } from '@/utils/albanian';
import { ensureDictionaryLoaded, isValidGuess } from '@/utils/dictionary';

const ROWS = 6;
const COLS = 5;

export function useWordleGame(targetWord: string, gameId?: string) {
  // Kick off dictionary loading once per hook usage
  ensureDictionaryLoaded();
  const [gameState, setGameState] = useState<GameState>(() => {
    const normalized = normalizeAlbanian(targetWord);
    const storageKey = gameId ? `friends-game-${gameId}` : `daily-game-progress`;
    
    // Try to load saved game state (without target word for security)
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
          targetWord: normalized  // Always use current target, never stored
        };
      } catch (e) {
        console.warn('Failed to parse saved game state');
      }
    }
    
    return {
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing' as const,
      guesses: [],
      targetWord: normalized,
      letterStates: new Map()
    };
  });

  const [isRevealing, setIsRevealing] = useState(false);

  const updateLetterStates = useCallback((guess: string, target: string) => {
    const newLetterStates = new Map(gameState.letterStates);
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter === target[i]) {
        newLetterStates.set(letter, 'correct');
      } else if (target.includes(letter) && newLetterStates.get(letter) !== 'correct') {
        newLetterStates.set(letter, 'partial');
      } else if (!target.includes(letter)) {
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
          
          // Check if the word is valid: must be in dictionary-based set
          const normalizedGuess = normalizeAlbanian(currentGuess);
          if (isValidGuess(normalizedGuess)) {
            newState.guesses.push(currentGuess);
            
            // Update letter states
            newState.letterStates = updateLetterStates(currentGuess, newState.targetWord);
            
            // Check if won
            if (normalizedGuess === newState.targetWord) {
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
          }
        }
      } else if (newState.currentCol < COLS && key.length === 1) {
        newState.board[newState.currentRow][newState.currentCol] = key;
        newState.currentCol++;
      }
      
      // Save game state to localStorage (excluding target word for security)
      const storageKey = gameId ? `friends-game-${gameId}` : `daily-game-progress`;
      const stateToSave = {
        board: newState.board,
        currentRow: newState.currentRow,
        currentCol: newState.currentCol,
        gameStatus: newState.gameStatus,
        guesses: newState.guesses,
        // Never store the target word for security
        letterStates: Object.fromEntries(newState.letterStates)
      };
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
      
      return newState;
    });
  }, [gameState.gameStatus, gameState.letterStates, isRevealing, updateLetterStates, gameId]);

  const resetGame = useCallback((newTargetWord?: string) => {
    const normalized = normalizeAlbanian(newTargetWord || targetWord);
    const storageKey = gameId ? `friends-game-${gameId}` : `daily-game-progress`;
    
    // Clear saved state
    localStorage.removeItem(storageKey);
    
    setGameState({
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing',
      guesses: [],
      targetWord: normalized,
      letterStates: new Map()
    });
    setIsRevealing(false);
  }, [targetWord, gameId]);

  return {
    gameState,
    isRevealing,
    handleKeyPress,
    resetGame
  };
}