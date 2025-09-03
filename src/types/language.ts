export type Language = 'albanian' | 'english';

export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
  keyboardLayout: string[][];
  alphabet: string[];
  normalizeFunction: (text: string) => string;
  isValidWordFunction: (word: string) => boolean;
  dictionaryPath: string;
}

export interface Translations {
  // Header
  home: string;
  daily: string;
  freeGame: string;
  friends: string;
  resetGame: string;
  
  // Daily Game
  todaysWord: string;
  completed: string;
  congratulations: string;
  betterLuck: string;
  share: string;
  comeBackTomorrow: string;
  
  // Friends Game
  createGameForFriends: string;
  enterFiveLetterWord: string;
  yourName: string;
  createGame: string;
  invalidWord: string;
  pleaseEnterValidWord: string;
  nameMissing: string;
  pleaseEnterName: string;
  gameCreated: string;
  nowShareLink: string;
  copied: string;
  linkCopied: string;
  error: string;
  couldNotCopy: string;
  challengeFrom: string;
  youWon: string;
  youGuessedWord: string;
  betterLuckNextTime: string;
  theWordWas: string;
  
  // General
  loading: string;
  tryAgain: string;
  help: string;
  statistics: string;
  settings: string;
  language: string;
  newGame: string;
  
  // Main Page
  mainTagline: string;
  dailyDescription: string;
  playToday: string;
  freeGameDescription: string;
  startGame: string;
  friendsDescription: string;
  createGameButton: string;
  howToPlay: string;
  correct: string;
  correctDescription: string;
  partial: string;
  partialDescription: string;
  wrong: string;
  wrongDescription: string;
}
