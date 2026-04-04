import { Button } from '@/components/ui/button';
import { LetterState } from '@/types/game';
import { cn } from '@/lib/utils';
import { Delete, CornerDownLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AlbanianKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
  className?: string;
  /** Tighter keys and padding so the keyboard fits in the viewport with the grid (desktop + short windows). */
  compact?: boolean;
}

export function AlbanianKeyboard({
  onKeyPress,
  letterStates,
  disabled = false,
  className,
  compact = false,
}: AlbanianKeyboardProps) {
  const { config } = useLanguage();
  const getKeyVariant = (key: string) => {
    const state = letterStates.get(key);
    switch (state) {
      case 'correct':
        return 'correct';
      case 'partial':
        return 'partial';
      case 'incorrect':
        return 'incorrect';
      default:
        return 'secondary';
    }
  };

  const renderKey = (key: string) => {
    const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      // Add haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Very short vibration
      }

      // Add press animation
      const button = e.currentTarget;
      button.classList.add('animate-key-press');

      // Remove animation class after animation completes
      setTimeout(() => {
        button.classList.remove('animate-key-press');
      }, 150);

      onKeyPress(key);
    };

    return (
      <Button
        key={key}
        variant={getKeyVariant(key)}
        size="sm"
        className={cn(
          'shadow-keyboard font-bold w-full flex-1 min-w-0 relative overflow-hidden',
          'active:scale-95 active:shadow-sm transition-all duration-150 ease-out touch-manipulation select-none',
          compact
            ? 'h-8 min-h-8 sm:h-9 sm:min-h-9 px-0.5 sm:px-1 text-[10px] sm:text-xs'
            : 'h-10 sm:h-12 md:h-14 px-1 sm:px-2 md:px-3 text-[10px] sm:text-sm md:text-lg min-h-[44px] sm:min-h-[48px]',
          isSpecial && (compact ? 'px-1 sm:px-2 font-semibold' : 'px-2 sm:px-3 md:px-4 font-semibold'),
          key.length > 1 &&
            key !== 'ENTER' &&
            key !== 'BACKSPACE' &&
            (compact ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-xs md:text-base'),
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleClick}
        disabled={disabled}
        style={{ flexGrow: isSpecial ? 1.4 : 1 }}
      >
        {key === 'BACKSPACE' ? (
          <Delete className={compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'} />
        ) : key === 'ENTER' ? (
          <CornerDownLeft className={compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5'} />
        ) : (
          <span>{key}</span>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        'w-full max-w-full mx-auto glass-strong shadow-keyboard',
        compact
          ? 'px-1 py-1.5 sm:px-2 sm:py-2 rounded-t-xl sm:rounded-xl'
          : 'md:max-w-4xl px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 rounded-t-2xl md:rounded-2xl',
        className
      )}
      style={{ paddingBottom: compact ? 'max(env(safe-area-inset-bottom), 6px)' : 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <div className={compact ? 'space-y-0.5 sm:space-y-1' : 'space-y-1 sm:space-y-2'}>
        {config.keyboardLayout.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn('flex justify-center w-full', compact ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-2')}
          >
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
}