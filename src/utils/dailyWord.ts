import { SAMPLE_WORDS } from './albanian';

// Get today's date as a string (YYYY-MM-DD) in local timezone
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
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
export function getDailyWord(): string {
  const dateStr = getTodayDateString();
  const hash = simpleHash(dateStr);
  const index = hash % SAMPLE_WORDS.length;
  return SAMPLE_WORDS[index];
}

// Get formatted date for display
export function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString('sq-AL', { 
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