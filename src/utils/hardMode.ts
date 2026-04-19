import { LetterState } from '@/types/game';

export type HardModeHints = {
  correctPositions: Record<number, string>;
  requiredLetters: Set<string>;
};

export type HardModeValidationError =
  | { code: 'hard_mode_position'; letter: string; position: number }
  | { code: 'hard_mode_letter'; letter: string };

export function createEmptyHardModeHints(): HardModeHints {
  return {
    correctPositions: {},
    requiredLetters: new Set<string>(),
  };
}

export function updateHardModeHints(
  previous: HardModeHints,
  guess: string,
  feedback: LetterState[]
): HardModeHints {
  const next: HardModeHints = {
    correctPositions: { ...previous.correctPositions },
    requiredLetters: new Set(previous.requiredLetters),
  };

  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const state = feedback[i];
    if (state === 'correct') {
      next.correctPositions[i] = letter;
      next.requiredLetters.add(letter);
    } else if (state === 'partial') {
      next.requiredLetters.add(letter);
    }
  }

  return next;
}

export function validateGuessAgainstHardMode(
  guess: string,
  hints: HardModeHints
): HardModeValidationError | null {
  for (const [indexKey, requiredLetter] of Object.entries(hints.correctPositions)) {
    const index = Number(indexKey);
    if (guess[index] !== requiredLetter) {
      return {
        code: 'hard_mode_position',
        letter: requiredLetter,
        position: index + 1,
      };
    }
  }

  for (const letter of hints.requiredLetters) {
    if (!guess.includes(letter)) {
      return {
        code: 'hard_mode_letter',
        letter,
      };
    }
  }

  return null;
}
