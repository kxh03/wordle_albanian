import { GameTile } from './GameTile';
import { GameState } from '@/types/game';
import { normalizeAlbanian } from '@/utils/albanian';

interface GameBoardProps {
  gameState: GameState;
  revealingRow?: number;
}

export function GameBoard({ gameState, revealingRow }: GameBoardProps) {
  const { board, letterStates } = gameState;

  const getTileState = (row: number, col: number, letter: string) => {
    if (row < gameState.currentRow || (row === gameState.currentRow && gameState.gameStatus !== 'playing')) {
      // Completed row - calculate state based on target word
      const targetWord = normalizeAlbanian(gameState.targetWord);
      const normalizedLetter = normalizeAlbanian(letter);
      if (!normalizedLetter) return 'unused';
      
      if (normalizedLetter === targetWord[col]) {
        return 'correct';
      } else if (targetWord.includes(normalizedLetter)) {
        // Check if this letter appears later in the target at the correct position
        // to avoid false positives with repeated letters
        const targetLetters = targetWord.split('');
        const guessLetters = board[row].map(normalizeAlbanian);
        
        // Count correct positions first
        let correctCount = 0;
        let availableCount = 0;
        
        for (let i = 0; i < targetLetters.length; i++) {
          if (targetLetters[i] === normalizedLetter) {
            if (guessLetters[i] === normalizedLetter) {
              correctCount++;
            } else {
              availableCount++;
            }
          }
        }
        
        // Count partials before this position
        let partialsBefore = 0;
        for (let i = 0; i < col; i++) {
          if (guessLetters[i] === normalizedLetter && targetLetters[i] !== normalizedLetter) {
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
    <div className="grid grid-rows-6 gap-1 sm:gap-2 p-2 sm:p-4">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-1 sm:gap-2 justify-center">
          {row.map((letter, colIndex) => (
            <GameTile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              state={getTileState(rowIndex, colIndex, letter)}
              isRevealing={gameState.gameStatus === 'playing' && revealingRow === rowIndex}
              delay={colIndex * 100}
            />
          ))}
        </div>
      ))}
    </div>
  );
}