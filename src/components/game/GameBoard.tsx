import { GameTile } from './GameTile';
import { GameState } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameBoardProps {
  gameState: GameState;
  revealingRow?: number;
  getTargetWord?: () => string;
  isWordCompleteAnimating?: boolean;
}

export function GameBoard({ gameState, revealingRow, getTargetWord, isWordCompleteAnimating = false }: GameBoardProps) {
  const { board, letterStates } = gameState;
  const { config } = useLanguage();

  const getTileState = (row: number, col: number, letter: string) => {
    if (row < gameState.currentRow || (row === gameState.currentRow && gameState.gameStatus !== 'playing')) {
      // Completed row - calculate state based on target word
      const targetWord = config.normalizeFunction(getTargetWord ? getTargetWord() : "");
      const normalizedLetter = config.normalizeFunction(letter);
      if (!normalizedLetter) return 'unused';
      
      if (normalizedLetter === targetWord[col]) {
        return 'correct';
      } else if (targetWord.includes(normalizedLetter)) {
        // Check if this letter appears later in the target at the correct position
        // to avoid false positives with repeated letters
        const targetLetters = targetWord.split('');
        const guessLetters = board[row].map(config.normalizeFunction);
        
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
    <div className="grid grid-rows-6 gap-1.5 sm:gap-2 md:gap-3 p-1 sm:p-2 md:p-4 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 justify-center">
          {row.map((letter, colIndex) => (
            <GameTile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              state={getTileState(rowIndex, colIndex, letter)}
              isRevealing={gameState.gameStatus === 'playing' && revealingRow === rowIndex}
              delay={colIndex * 80}
              isWordComplete={isWordCompleteAnimating && letter !== '' && rowIndex <= gameState.currentRow}
              wordCompleteDelay={colIndex * 150}
            />
          ))}
        </div>
      ))}
    </div>
  );
}