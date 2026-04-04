import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { AlbanianKeyboard } from './AlbanianKeyboard';
import { LetterState } from '@/types/game';

interface KeyboardOverlayProps {
  onKeyPress: (key: string) => void;
  letterStates: Map<string, LetterState>;
  disabled?: boolean;
  /** Show the overlay on fine-pointer devices too (e.g. Create Game word entry on desktop). */
  alwaysShow?: boolean;
}

export function KeyboardOverlay({
  onKeyPress,
  letterStates,
  disabled = false,
  alwaysShow = false,
}: KeyboardOverlayProps) {
  const [isTouch, setIsTouch] = useState(true);
  const [suppressForInputFocus, setSuppressForInputFocus] = useState(false);

  // Detect coarse pointer (touch) to show overlay only on mobile/tablets
  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)');
    const updatePointer = () => setIsTouch(mql.matches || 'ontouchstart' in window);
    updatePointer();
    mql.addEventListener?.('change', updatePointer);
    return () => mql.removeEventListener?.('change', updatePointer);
  }, []);

  // Suppress when typing in inputs/textareas/contenteditable even on mobile
  useEffect(() => {
    const onFocusChange = () => {
      const active = document.activeElement as HTMLElement | null;
      const isFormField = !!active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
      setSuppressForInputFocus(isFormField);
    };
    document.addEventListener('focusin', onFocusChange);
    document.addEventListener('focusout', onFocusChange);
    onFocusChange();
    return () => {
      document.removeEventListener('focusin', onFocusChange);
      document.removeEventListener('focusout', onFocusChange);
    };
  }, []);

  const allowOverlay = alwaysShow || isTouch;
  if (!allowOverlay || suppressForInputFocus) {
    return null;
  }

  const overlay = (
    <div
      className="fixed inset-x-0 bottom-0 z-[2147483647] w-full max-w-[100vw]"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
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


