import { GameTile } from './GameTile';
import { GameState } from '@/types/game';

interface GameBoardProps {
  gameState: GameState;
  revealingRow?: number;
}

export function GameBoard({ gameState, revealingRow }: GameBoardProps) {
  const { board, letterStates } = gameState;

  const getTileState = (row: number, col: number, letter: string) => {
    if (row < gameState.currentRow || (row === gameState.currentRow && gameState.gameStatus !== 'playing')) {
      // Completed row - calculate state based on target word
      const targetWord = gameState.targetWord;
      if (!letter) return 'unused';
      
      if (letter === targetWord[col]) {
        return 'correct';
      } else if (targetWord.includes(letter)) {
        // Check if this letter appears later in the target at the correct position
        // to avoid false positives with repeated letters
        const targetLetters = targetWord.split('');
        const guessLetters = gameState.board[row];
        
        // Count correct positions first
        let correctCount = 0;
        let availableCount = 0;
        
        for (let i = 0; i < targetLetters.length; i++) {
          if (targetLetters[i] === letter) {
            if (guessLetters[i] === letter) {
              correctCount++;
            } else {
              availableCount++;
            }
          }
        }
        
        // Count partials before this position
        let partialsBefore = 0;
        for (let i = 0; i < col; i++) {
          if (guessLetters[i] === letter && targetLetters[i] !== letter) {
            partialsBefore++;
          }
        }
        
        return partialsBefore < availableCount ? 'partial' : 'incorrect';
      } else {
        return 'incorrect';
      }
    }
    return 'unused';
  };

  return (
    <div className="grid grid-rows-6 gap-2 p-4">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-2 justify-center">
          {row.map((letter, colIndex) => (
            <GameTile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              state={getTileState(rowIndex, colIndex, letter)}
              isRevealing={revealingRow === rowIndex}
              delay={colIndex * 100}
            />
          ))}
        </div>
      ))}
    </div>
  );
}