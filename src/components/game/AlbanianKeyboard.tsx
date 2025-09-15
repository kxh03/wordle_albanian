import { Button } from '@/components/ui/button';
import { useState } from 'react';
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
    const isPressed = pressedKeys.has(key);
    
    const handleClick = () => {
      if (disabled) return;
      
      setPoppedKey(key);
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
      }, 250);
    };

    return (
      <Button
        key={key}
        variant={getKeyVariant(key)}
        size="sm"
        className={cn(
          // Enhanced keyboard styling
          'shadow-keyboard font-bold w-full flex-1 min-w-0 h-10 sm:h-12 md:h-14 px-1 sm:px-2 md:px-3 text-[10px] sm:text-sm md:text-lg transition-all duration-150 relative overflow-hidden',
          // Special key styling
          isSpecial && 'px-2 sm:px-3 md:px-4 font-semibold',
          // Multi-character key styling
          key.length > 1 && key !== 'ENTER' && key !== 'BACKSPACE' && 'text-[9px] sm:text-xs md:text-base',
          // Pressed state with enhanced feedback
          isPressed && 'scale-95 shadow-sm animate-key-press',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          // Hover effects
          !disabled && 'hover:scale-105 hover:shadow-lg active:scale-95'
        )}
        onClick={handleClick}
        disabled={disabled}
        style={{ flexGrow: isSpecial ? 1.4 : 1 }}
      >
        {/* Subtle shine effect for keys */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
        
        {key === 'BACKSPACE' ? (
          <Delete className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10" />
        ) : key === 'ENTER' ? (
          <CornerDownLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10" />
        ) : (
          <span className="relative inline-block z-10">
            {key}
            {poppedKey === key && (
              <span className="absolute left-1/2 top-0 animate-key-pop key-pop-bubble pointer-events-none select-none z-50">
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