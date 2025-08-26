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
        'w-14 h-14 border-2 rounded-md flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-tile transform',
        getStateClasses(),
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