import { Button } from '@/components/ui/button';
import { KEYBOARD_LAYOUT } from '@/utils/albanian';
import { LetterState } from '@/types/game';
import { cn } from '@/lib/utils';
import { Delete, CornerDownLeft } from 'lucide-react';

interface AlbanianKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
}

export function AlbanianKeyboard({ onKeyPress, letterStates, disabled = false }: AlbanianKeyboardProps) {
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
    
    return (
      <Button
        key={key}
        variant={getKeyVariant(key)}
        size={isSpecial ? 'lg' : 'sm'}
        className={cn(
          'shadow-keyboard font-semibold transition-all hover:scale-105',
          isSpecial && 'px-3',
          key.length > 1 && key !== 'ENTER' && key !== 'BACKSPACE' && 'text-xs'
        )}
        onClick={() => onKeyPress(key)}
        disabled={disabled}
      >
        {key === 'BACKSPACE' ? (
          <Delete className="w-4 h-4" />
        ) : key === 'ENTER' ? (
          <CornerDownLeft className="w-4 h-4" />
        ) : (
          key
        )}
      </Button>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-card/50 rounded-lg backdrop-blur-sm">
      <div className="space-y-2">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map(renderKey)}
          </div>
        ))}
      </div>
    </div>
  );
}