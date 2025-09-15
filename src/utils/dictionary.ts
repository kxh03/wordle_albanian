import { normalizeAlbanian, getAlbanianVariations } from './albanian';
import { useLanguage } from '@/contexts/LanguageContext';

type DictionaryEntry = {
  term: string;
  definition: string[];
};

type DictionaryData = DictionaryEntry[] | {
  words: string[];
};

let cachedTerms: string[] = [];
let cachedSet: ReadonlySet<string> = new Set();
let loadingPromise: Promise<void> | null = null;
let currentLanguage: string | null = null;

const extractTerms = (data: DictionaryData, normalizeFunction: (text: string) => string): string[] => {
  const seen = new Set<string>();
  const terms: string[] = [];

  // Handle both dictionary formats
  if (Array.isArray(data)) {
    // New format: array of objects with term and definition
    for (const entry of data) {
      if (!entry.term || typeof entry.term !== 'string') continue;
      
      // Extract the actual word from the term (remove grammatical info)
      const termParts = entry.term.split(' ');
      const word = termParts[0];
      
      const normalized = normalizeFunction(word);
      if (normalized.length !== 5) continue;
      if (seen.has(normalized)) continue;

      seen.add(normalized);
      terms.push(normalized);
    }
  } else if (data.words) {
    // Old format: object with words array
    for (const word of data.words) {
      if (!word || typeof word !== 'string') continue;
      
      const normalized = normalizeFunction(word);
      if (normalized.length !== 5) continue;
      if (seen.has(normalized)) continue;

      seen.add(normalized);
      terms.push(normalized);
    }
  }

  return terms;
};

export function getFiveLetterTermsSync(): string[] {
  return cachedTerms;
}

export function isDictionaryReady(language?: string): boolean {
  if (language && currentLanguage && language !== currentLanguage) return false;
  return cachedSet.size > 0;
}

export function isValidGuess(word: string, normalizeFunction: (text: string) => string = normalizeAlbanian): boolean {
  if (!word) return false;
  const normalized = normalizeFunction(word);
  
  // First check the normalized version
  if (cachedSet.has(normalized)) return true;
  
  // For Albanian, also check variations with special characters
  if (normalizeFunction === normalizeAlbanian) {
    const variations = getAlbanianVariations(word);
    for (const variation of variations) {
      if (cachedSet.has(variation)) return true;
    }
  }
  
  return false;
}

export function getDictionaryStatus(): { language: string | null, wordCount: number, sampleWords: string[] } {
  return {
    language: currentLanguage,
    wordCount: cachedTerms.length,
    sampleWords: cachedTerms.slice(0, 10)
  };
}

export function ensureDictionaryLoaded(language: string = 'albanian', normalizeFunction: (text: string) => string = normalizeAlbanian): Promise<void> {
  // If we already have the correct language loaded, return immediately
  if (currentLanguage === language && cachedTerms.length > 0) {
    return Promise.resolve();
  }

  // If we're switching languages, clear the current cache and provide immediate fallbacks
  if (currentLanguage && currentLanguage !== language) {
    cachedTerms = [];
    cachedSet = new Set();
    loadingPromise = null;
    
    // Immediately provide real fallback words from the dictionaries
    const fallbackWords = language === 'english' 
      ? ['ABOUT', 'HOUSE', 'WORLD', 'MUSIC', 'HAPPY', 'LIGHT', 'HEART', 'WATER', 'PEACE', 'DREAM']
      : ['ANDEJ', 'DIÇKA', 'KËTEJ', 'MJAFT', 'SEPSE', 'SIPËR', 'TEPËR', 'TUTJE', 'KREJT', 'PRANË'];
    cachedTerms = fallbackWords;
    cachedSet = new Set(fallbackWords);
  }

  // If we're already loading this language, return the existing promise
  if (loadingPromise && currentLanguage === language) {
    return loadingPromise;
  }

  const dictionaryPath = language === 'english' ? '/dictionary-en.json' : '/dictionary.json';
  
  currentLanguage = language; // Set this early to prevent race conditions
  
  // If we don't have any words yet, provide immediate fallbacks
  if (cachedTerms.length === 0) {
    const fallbackWords = language === 'english' 
      ? ['ABOUT', 'HOUSE', 'WORLD', 'MUSIC', 'HAPPY', 'LIGHT', 'HEART', 'WATER', 'PEACE', 'DREAM']
      : ['ANDEJ', 'DIÇKA', 'KËTEJ', 'MJAFT', 'SEPSE', 'SIPËR', 'TEPËR', 'TUTJE', 'KREJT', 'PRANË'];
    cachedTerms = fallbackWords;
    cachedSet = new Set(fallbackWords);
  }
  
  loadingPromise = fetch(dictionaryPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load dictionary: ${response.status}`);
      }
      return response.json();
    })
    .then((data: DictionaryData) => {
      const newTerms = extractTerms(data, normalizeFunction);
      if (newTerms.length > 0) {
        cachedTerms = newTerms;
        cachedSet = new Set(newTerms);
        console.log(`Dictionary loaded for ${language}: ${cachedTerms.length} words`);
      }
    })
    .catch((error) => {
      console.error(`Error loading dictionary for ${language}:`, error);
      // Keep the fallback words we already set
    })
    .finally(() => {
      loadingPromise = null; // Clear the promise when done
    });
  
  return Promise.resolve(); // Return immediately, don't wait for the fetch
}


