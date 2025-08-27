import { normalizeAlbanian } from './albanian';

type DictionaryEntry = {
  term?: string;
  [key: string]: unknown;
};

let cachedTerms: string[] = [];
let cachedSet: ReadonlySet<string> = new Set();
let loadingPromise: Promise<void> | null = null;

const extractTerms = (entries: DictionaryEntry[]): string[] => {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const entry of entries) {
    if (!entry || typeof entry.term !== 'string') continue;
    const firstToken = entry.term.split(' ')[0];
    if (!firstToken) continue;

    const normalized = normalizeAlbanian(firstToken);
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

export function isValidGuess(word: string): boolean {
  if (!word) return false;
  const normalized = normalizeAlbanian(word);
  return cachedSet.has(normalized);
}

export function ensureDictionaryLoaded(): Promise<void> {
  if (loadingPromise) return loadingPromise;
  loadingPromise = import('../../dictionary.json')
    .then(mod => {
      const entries = (mod.default || mod) as unknown as DictionaryEntry[];
      cachedTerms = extractTerms(entries);
      cachedSet = new Set(cachedTerms);
    })
    .catch(() => {
      cachedTerms = [];
      cachedSet = new Set();
    });
  return loadingPromise;
}


