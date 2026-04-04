import { AlbanianKeyboard } from './AlbanianKeyboard';
import { LetterState } from '@/types/game';

type GameScreenKeyboardProps = {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
};

/**
 * In-flow keyboard pinned below the board inside a flex column so it stays visible
 * without relying on a fixed overlay (fixes Windows/desktop + no touch pointer).
 */
export function GameScreenKeyboard({ onKeyPress, letterStates, disabled }: GameScreenKeyboardProps) {
  return (
    <div className="shrink-0 w-full max-w-lg mx-auto border-t border-border/90 bg-background/95 px-1.5 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] sm:px-2">
      <AlbanianKeyboard
        onKeyPress={onKeyPress}
        letterStates={letterStates}
        disabled={disabled}
        compact
        className="w-full !rounded-t-none !rounded-b-lg !shadow-none !bg-transparent !backdrop-blur-none"
      />
    </div>
  );
}
