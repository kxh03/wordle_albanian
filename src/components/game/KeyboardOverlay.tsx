import { createPortal } from 'react-dom';
import { AlbanianKeyboard } from './AlbanianKeyboard';
import { LetterState } from '@/types/game';

interface KeyboardOverlayProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
}

export function KeyboardOverlay({ onKeyPress, letterStates, disabled = false }: KeyboardOverlayProps) {
  const overlay = (
    <div
      className="fixed inset-x-0 bottom-0 z-[2147483647]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <AlbanianKeyboard
        onKeyPress={onKeyPress}
        letterStates={letterStates}
        disabled={disabled}
        className="rounded-t-xl shadow-lg"
      />
    </div>
  );

  return createPortal(overlay, document.body);
}


