export interface GameState {
  board: string[][];
  currentRow: number;
  currentCol: number;
  gameStatus: 'playing' | 'won' | 'lost';
  guesses: string[];
  targetWord: string;
  letterStates: Map<string, LetterState>;
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
}