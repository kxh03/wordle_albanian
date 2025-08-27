import { cn } from '@/lib/utils';
import { LetterState } from '@/types/game';

interface GameTileProps {
  letter: string;
  state: LetterState;
  isRevealing?: boolean;
  delay?: number;
}

export function GameTile({ letter, state, isRevealing = false, delay = 0 }: GameTileProps) {
  const getStateClasses = () => {
    switch (state) {
      case 'correct':
        return 'bg-correct text-correct-foreground border-correct';
      case 'partial':
        return 'bg-partial text-partial-foreground border-partial';
      case 'incorrect':
        return 'bg-incorrect text-incorrect-foreground border-incorrect';
      default:
        return 'bg-card text-foreground border-border hover:border-accent';
    }
  };

  return (
    <div 
      className={cn(
        'w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-md flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-300 shadow-tile transform',
        getStateClasses(),
        // When a letter is typed but tile hasn't been evaluated yet, highlight it
        (state === 'unused' && letter) && 'bg-accent text-accent-foreground border-accent',
        isRevealing && 'animate-flip scale-110',
        letter && 'scale-105 hover:scale-110'
      )}
      style={{ 
        animationDelay: isRevealing ? `${delay}ms` : '0ms' 
      }}
    >
      {letter}
    </div>
  );
}