import { normalizeAlbanian } from './albanian';
import { useLanguage } from '@/contexts/LanguageContext';

type DictionaryEntry = {
  term?: string;
  [key: string]: unknown;
};

type DictionaryData = {
  words: string[];
};

let cachedTerms: string[] = [];
let cachedSet: ReadonlySet<string> = new Set();
let loadingPromise: Promise<void> | null = null;
let currentLanguage: string | null = null;

const extractTerms = (data: DictionaryData, normalizeFunction: (text: string) => string): string[] => {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const word of data.words) {
    if (!word || typeof word !== 'string') continue;
    
    const normalized = normalizeFunction(word);
    if (normalized.length !== 5) continue;
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    terms.push(normalized);
  }

  return terms;
};

export function getFiveLetterTermsSync(): string[] {
  return cachedTerms;
}

export function isValidGuess(word: string, normalizeFunction: (text: string) => string = normalizeAlbanian): boolean {
  if (!word) return false;
  const normalized = normalizeFunction(word);
  return cachedSet.has(normalized);
}

export function ensureDictionaryLoaded(language: string = 'albanian', normalizeFunction: (text: string) => string = normalizeAlbanian): Promise<void> {
  // If we already have the correct language loaded, return immediately
  if (currentLanguage === language && cachedTerms.length > 0) {
    return Promise.resolve();
  }

  // If we're loading the same language, return the existing promise
  if (loadingPromise && currentLanguage === language) {
    return loadingPromise;
  }

  const dictionaryPath = language === 'english' ? '/dictionary-en.json' : '/dictionary.json';
  
  loadingPromise = fetch(dictionaryPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }
      return response.json();
    })
    .then((data: DictionaryData) => {
      cachedTerms = extractTerms(data, normalizeFunction);
      cachedSet = new Set(cachedTerms);
      currentLanguage = language;
    })
    .catch((error) => {
      console.error(`Error loading dictionary for ${language}:`, error);
      cachedTerms = [];
      cachedSet = new Set();
      currentLanguage = language;
    });
  return loadingPromise;
}


