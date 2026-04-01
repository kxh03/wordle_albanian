export interface GameState {
  board: string[][];
  currentRow: number;
  currentCol: number;
  gameStatus: 'playing' | 'won' | 'lost';
  guesses: string[];
  letterStates: Map<string, LetterState>;
  /** When set (API mode), tile colors come from server per row */
  rowFeedback?: LetterState[][];
}

export type LetterState = 'correct' | 'partial' | 'incorrect' | 'unused';

export interface GameTile {
  letter: string;
  state: LetterState;
}

export interface CustomGame {
  id: string;
  word: string;
  creatorName: string;
  createdAt: number;
  language?: string;
}
