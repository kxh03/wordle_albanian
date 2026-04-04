import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LanguageConfig, Translations } from '@/types/language';
import { ALBANIAN_ALPHABET, KEYBOARD_LAYOUT, normalizeAlbanian, isValidAlbanianWord } from '@/utils/albanian';

// English keyboard layout
const ENGLISH_KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// English alphabet
const ENGLISH_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// English normalization function
const normalizeEnglish = (text: string): string => {
  return text.toUpperCase().trim();
};

// English word validation
const isValidEnglishWord = (word: string): boolean => {
  const normalized = normalizeEnglish(word);
  if (normalized.length !== 5) return false;
  
  const validChars = new Set(ENGLISH_ALPHABET);
  for (let char of normalized) {
    if (!validChars.has(char)) return false;
  }
  
  return true;
};

// Language configurations
const languageConfigs: Record<Language, LanguageConfig> = {
  albanian: {
    code: 'albanian',
    name: 'Shqip',
    flag: '🇦🇱',
    keyboardLayout: KEYBOARD_LAYOUT,
    alphabet: ALBANIAN_ALPHABET,
    normalizeFunction: normalizeAlbanian,
    isValidWordFunction: isValidAlbanianWord,
  },
  english: {
    code: 'english',
    name: 'English',
    flag: '🇺🇸',
    keyboardLayout: ENGLISH_KEYBOARD_LAYOUT,
    alphabet: ENGLISH_ALPHABET,
    normalizeFunction: normalizeEnglish,
    isValidWordFunction: isValidEnglishWord,
  }
};

// Translations
const translations: Record<Language, Translations> = {
  albanian: {
    // Header
    home: 'Faqja kryesore',
    daily: 'Fjala e Ditës',
    freeGame: 'Lojë e Lirë',
    friends: 'Sfido Miqtë',
    resetGame: 'Rivendos Lojën',
    login: 'Hyr',
    register: 'Regjistrohu',
    logout: 'Dil',
    
    // Daily Game
    todaysWord: 'Fjala e Sotme',
    completed: 'Përfunduar',
    congratulations: 'Përkrahje!',
    betterLuck: 'Më keq sot!',
    share: 'Ndaj',
    comeBackTomorrow: 'Kthehuni nesër për një fjalë të re!',
    
    // Friends Game
    createGameForFriends: 'Krijo Lojë për Miqtë',
    enterFiveLetterWord: 'Shkruaj një fjalë me 5 shkronja',
    yourName: 'Emri juaj',
    createGame: 'Krijo Lojën',
    invalidWord: 'Fjalë e pavlefshme',
    pleaseEnterValidWord: 'Ju lutemi shkruani një fjalë të vlefshme shqipe me 5 shkronja.',
    nameMissing: 'Emri mungon',
    pleaseEnterName: 'Ju lutemi shkruani emrin tuaj.',
    gameCreated: 'Loja u krijua!',
    nowShareLink: 'Tani mund të ndani lidhjen me miqtë tuaj.',
    copied: 'U kopjua!',
    linkCopied: 'Lidhja u kopjua në clipboard.',
    error: 'Gabim',
    couldNotCopy: 'Nuk mundëm të kopjojmë lidhjen.',
    challengeFrom: 'Sfida nga',
    youWon: 'Urime!',
    youGuessedWord: 'E gjetët fjalën e',
    betterLuckNextTime: 'Më keq sot!',
    theWordWas: 'Fjala ishte',
    
    // General
    loading: 'Duke ngarkuar lojën...',
    tryAgain: 'Provo Sërish',
    help: 'Ndihmë',
    statistics: 'Statistikat',
    settings: 'Cilësimet',
    language: 'Gjuha',
    newGame: 'Lojë e Re',
    
    // Main Page
    mainTagline: 'Loja e fjalëve më e dashur në botë, tani në gjuhën shqipe!',
    dailyDescription: 'Një fjalë e re çdo ditë. E njëjta fjalë për të gjithë!',
    playToday: 'Luaj Sot',
    freeGameDescription: 'Luaj sa herë të duash me fjalë të rastësishme!',
    startGame: 'Fillo Lojën',
    friendsDescription: 'Krijo lojëra të personalizuara dhe sfido miqtë tuaj!',
    createGameButton: 'Krijo Lojë',
    howToPlay: 'Si të luash',
    correct: 'E saktë',
    correctDescription: 'Shkronja është në vendin e duhur',
    partial: 'Pjesërisht',
    partialDescription: 'Shkronja është në fjalë por jo në vendin e duhur',
    wrong: 'Gabim',
    wrongDescription: 'Shkronja nuk është në fjalë'
  },
  english: {
    // Header
    home: 'Home',
    daily: 'Daily Word',
    freeGame: 'Free Game',
    friends: 'Challenge Friends',
    resetGame: 'Reset Game',
    login: 'Log in',
    register: 'Register',
    logout: 'Log out',
    
    // Daily Game
    todaysWord: 'Today\'s Word',
    completed: 'Completed',
    congratulations: 'Congratulations!',
    betterLuck: 'Better luck next time!',
    share: 'Share',
    comeBackTomorrow: 'Come back tomorrow for a new word!',
    
    // Friends Game
    createGameForFriends: 'Create Game for Friends',
    enterFiveLetterWord: 'Enter a 5-letter word',
    yourName: 'Your name',
    createGame: 'Create Game',
    invalidWord: 'Invalid word',
    pleaseEnterValidWord: 'Please enter a valid English word with 5 letters.',
    nameMissing: 'Name missing',
    pleaseEnterName: 'Please enter your name.',
    gameCreated: 'Game created!',
    nowShareLink: 'Now you can share the link with your friends.',
    copied: 'Copied!',
    linkCopied: 'Link copied to clipboard.',
    error: 'Error',
    couldNotCopy: 'Could not copy the link.',
    challengeFrom: 'Challenge from',
    youWon: 'You won!',
    youGuessedWord: 'You guessed',
    betterLuckNextTime: 'Better luck next time',
    theWordWas: 'The word from',
    
    // General
    loading: 'Loading game...',
    tryAgain: 'Try Again',
    help: 'Help',
    statistics: 'Statistics',
    settings: 'Settings',
    language: 'Language',
    newGame: 'New Game',
    
    // Main Page
    mainTagline: 'The most beloved word game in the world, now in Albanian!',
    dailyDescription: 'A new word every day. The same word for everyone!',
    playToday: 'Play Today',
    freeGameDescription: 'Play as many times as you want with random words!',
    startGame: 'Start Game',
    friendsDescription: 'Create personalized games and challenge your friends!',
    createGameButton: 'Create Game',
    howToPlay: 'How to Play',
    correct: 'Correct',
    correctDescription: 'The letter is in the correct place',
    partial: 'Partial',
    partialDescription: 'The letter is in the word but not in the correct place',
    wrong: 'Wrong',
    wrongDescription: 'The letter is not in the word'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  config: LanguageConfig;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('wordle-language');
    return (saved as Language) || 'albanian';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('wordle-language', newLanguage);
  };

  const config = languageConfigs[language];
  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, config, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
