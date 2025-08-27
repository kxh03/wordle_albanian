import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { KEYBOARD_LAYOUT } from '@/utils/albanian';
import { LetterState } from '@/types/game';
import { cn } from '@/lib/utils';
import { Delete, CornerDownLeft } from 'lucide-react';

interface AlbanianKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
  className?: string;
}

export function AlbanianKeyboard({ onKeyPress, letterStates, disabled = false, className }: AlbanianKeyboardProps) {
  const [poppedKey, setPoppedKey] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
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
      setPoppedKey(key);
      // Transient pressed visual on the keycap
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      onKeyPress(key);
      setTimeout(() => {
        setPoppedKey(prev => (prev === key ? null : prev));
        setPressedKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 220);
    };

    return (
      <Button
        key={key}
        variant={getKeyVariant(key)}
        size="sm"
        className={cn(
          'shadow-keyboard font-semibold w-full flex-1 min-w-0 h-12 md:h-14 px-1 sm:px-2 md:px-3 text-[10px] sm:text-xs md:text-lg',
          isSpecial && 'px-2 sm:px-3 md:px-4',
          key.length > 1 && key !== 'ENTER' && key !== 'BACKSPACE' && 'text-[9px] xs:text-[10px] sm:text-xs',
          pressedKeys.has(key) && 'bg-primary/20 scale-105'
        )}
        onClick={handleClick}
        disabled={disabled}
        style={{ flexGrow: isSpecial ? 1.4 : 1 }}
      >
        {key === 'BACKSPACE' ? (
          <Delete className="w-4 h-4" />
        ) : key === 'ENTER' ? (
          <CornerDownLeft className="w-4 h-4" />
        ) : (
          <span className="relative inline-block">
            {key}
            {poppedKey === key && (
              <span className="absolute left-1/2 top-0 animate-key-pop key-pop-bubble pointer-events-none select-none">
                {key}
              </span>
            )}
          </span>
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "w-full max-w-full md:max-w-3xl mx-auto px-2 py-3 sm:px-3 sm:py-4 bg-card/80 rounded-2xl backdrop-blur-sm",
        className
      )}
      style={{ paddingBottom: 0 }}
    >
      <div className="space-y-1">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
}