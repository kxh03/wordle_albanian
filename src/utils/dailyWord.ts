import { getFiveLetterTermsSync } from './dictionary';
import { useLanguage } from '@/contexts/LanguageContext';

// Get today's date as a string (YYYY-MM-DD) in local timezone
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Simple hash function to convert date string to number
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get the daily word based on today's date
export function getDailyWord(language: string = 'albanian'): string {
  const dateStr = getTodayDateString();
  const hash = simpleHash(dateStr + language); // Include language in hash for different words per language
  const terms = getFiveLetterTermsSync();
  const fallbackWord = language === 'english' ? 'WORDS' : 'FJALË';

  // If no terms are loaded yet, return fallback
  if (terms.length === 0) {
    return fallbackWord;
  }

  const pool = terms;
  const index = hash % pool.length;
  const selectedWord = pool[index];
  return selectedWord;
}

export function getWordForDate(date: Date, language: string = 'albanian'): string {
  const dateStr = getDateString(date);
  const hash = simpleHash(dateStr + language); // Include language in hash for different words per language
  const terms = getFiveLetterTermsSync();
  const fallbackWord = language === 'english' ? 'WORDS' : 'FJALË';
  const pool = terms.length > 0 ? terms : [fallbackWord];
  const index = hash % pool.length;
  return pool[index];
}

// Get formatted date for display
export function getFormattedDate(language: string = 'albanian'): string {
  const now = new Date();
  const locale = language === 'english' ? 'en-US' : 'sq-AL';
  return now.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDate(date: Date, language: string = 'albanian'): string {
  const locale = language === 'english' ? 'en-US' : 'sq-AL';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Check if it's a new day (for clearing old daily game data)
export function isNewDay(): boolean {
  const today = getTodayDateString();
  const lastPlayedDate = localStorage.getItem('lastDailyPlayDate');
  return lastPlayedDate !== today;
}

// Mark today as played
export function markTodayAsPlayed(): void {
  const today = getTodayDateString();
  localStorage.setItem('lastDailyPlayDate', today);
}