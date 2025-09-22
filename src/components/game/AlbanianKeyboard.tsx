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
}

export function AlbanianKeyboard({ onKeyPress, letterStates, disabled = false, className }: AlbanianKeyboardProps) {
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
    
    const handleClick = () => {
      if (disabled) return;
      onKeyPress(key);
    };

    return (
      <Button
        key={key}
        variant={getKeyVariant(key)}
        size="sm"
        className={cn(
          // Enhanced keyboard styling
          'shadow-keyboard font-bold w-full flex-1 min-w-0 h-10 sm:h-12 md:h-14 px-1 sm:px-2 md:px-3 text-[10px] sm:text-sm md:text-lg relative overflow-hidden',
          // Special key styling
          isSpecial && 'px-2 sm:px-3 md:px-4 font-semibold',
          // Multi-character key styling
          key.length > 1 && key !== 'ENTER' && key !== 'BACKSPACE' && 'text-[9px] sm:text-xs md:text-base',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleClick}
        disabled={disabled}
        style={{ flexGrow: isSpecial ? 1.4 : 1 }}
      >
        {key === 'BACKSPACE' ? (
          <Delete className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        ) : key === 'ENTER' ? (
          <CornerDownLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        ) : (
          <span>{key}</span>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "w-full max-w-full md:max-w-4xl mx-auto px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 glass-strong rounded-t-2xl md:rounded-2xl shadow-keyboard",
        className
      )}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
    >
      <div className="space-y-1 sm:space-y-2">
        {config.keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2 w-full">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
}