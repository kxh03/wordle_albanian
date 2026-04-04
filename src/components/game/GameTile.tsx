import { cn } from '@/lib/utils';
import { LetterState } from '@/types/game';

interface GameTileProps {
  letter: string;
  state: LetterState;
  isRevealing?: boolean;
  delay?: number;
  isWordComplete?: boolean;
  wordCompleteDelay?: number;
  /** Fixed sizing for all breakpoints so the grid fits above the keyboard on desktop (Wordle-style). */
  compact?: boolean;
}

export function GameTile({
  letter,
  state,
  isRevealing = false,
  delay = 0,
  isWordComplete = false,
  wordCompleteDelay = 0,
  compact = false,
}: GameTileProps) {
  const getStateClasses = () => {
    switch (state) {
      case 'correct':
        return 'bg-gradient-to-br from-correct to-correct/90 text-correct-foreground border-correct shadow-lg';
      case 'partial':
        return 'bg-gradient-to-br from-partial to-partial/90 text-partial-foreground border-partial shadow-lg';
      case 'incorrect':
        return 'bg-gradient-to-br from-incorrect to-incorrect/90 text-incorrect-foreground border-incorrect shadow-md';
      default:
        return '';
    }
  };

  return (
    <div 
      className={cn(
        'border-2 rounded-md sm:rounded-lg flex items-center justify-center font-bold transition-none shadow-tile transform relative overflow-hidden',
        compact
          ? 'w-[3.25rem] h-[3.25rem] sm:w-[3.5rem] sm:h-[3.5rem] text-lg sm:text-xl'
          : 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-lg sm:text-xl md:text-2xl',
        // Default state with gradient background
        state === 'unused' && !letter && 'bg-gradient-tile border-border hover:border-accent hover:shadow-card',
        // Typed letter state
        state === 'unused' && letter && 'bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-accent shadow-card scale-105',
        getStateClasses(),
        // Animation states
        // Disable reveal flip animation
        false,
        letter && !isRevealing && !isWordComplete && 'hover:scale-105 hover:shadow-card',
        // Add subtle floating animation for empty tiles
        state === 'unused' && !letter && 'hover:animate-pulse-subtle',
        // Word completion color wave animation
        // Disabled word completion color wave
        false
      )}
      
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      
      {/* Letter content */}
      <span className="relative z-10 select-none">
        {letter}
      </span>
    </div>
  );
}