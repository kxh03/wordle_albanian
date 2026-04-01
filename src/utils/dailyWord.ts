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

// Get formatted date for display
export function getFormattedDate(language: string = 'albanian'): string {
  const now = new Date();
  const locale = language === 'english' ? 'en-US' : 'sq-AL';
  return now.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDate(date: Date, language: string = 'albanian'): string {
  const locale = language === 'english' ? 'en-US' : 'sq-AL';
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
