import { http } from '@/lib/http';
import type { ApiLanguage } from '@/lib/api';

export type DailyGuessRow = {
  guess: string;
  result: ('correct' | 'partial' | 'incorrect')[];
  guess_number: number;
};

export type DailyGameState = {
  date: string;
  language: string;
  attempts: number;
  attempts_left: number;
  is_completed: boolean;
  is_won: boolean;
  guesses: DailyGuessRow[];
  target_word: string | null;
};

export type DailyGuessResponse = {
  result: ('correct' | 'partial' | 'incorrect')[];
  is_won: boolean;
  attempts_left: number;
  is_completed: boolean;
  target_word?: string;
};

export type DailyHistoryEntry = {
  date: string;
  is_won: boolean;
  attempts: number;
};

export type CalendarDay = {
  date: string;
  status: 'won' | 'lost' | 'not_played';
  attempts: number | null;
};

export type UserStats = {
  current_streak: number;
  max_streak: number;
  total_wins: number;
  total_games: number;
};

function langHeaders(language: ApiLanguage) {
  return { 'X-Language': language };
}

export async function fetchDailyState(language: ApiLanguage, date: string): Promise<DailyGameState> {
  const { data } = await http.get<DailyGameState>('/daily', {
    params: { date },
    headers: langHeaders(language),
  });
  return data;
}

export async function postDailyGuess(
  language: ApiLanguage,
  guess: string,
  date?: string
): Promise<DailyGuessResponse> {
  const { data } = await http.post<DailyGuessResponse>(
    '/daily/guess',
    { guess, ...(date ? { date } : {}) },
    { headers: langHeaders(language) }
  );
  return data;
}

export async function fetchDailyHistory(language: ApiLanguage): Promise<DailyHistoryEntry[]> {
  const { data } = await http.get<DailyHistoryEntry[]>('/daily/history', {
    headers: langHeaders(language),
  });
  return data;
}

export async function fetchDailyCalendar(
  language: ApiLanguage,
  month: string
): Promise<CalendarDay[]> {
  const { data } = await http.get<CalendarDay[]>('/daily/calendar', {
    params: { month },
    headers: langHeaders(language),
  });
  return data;
}

export async function fetchUserStats(language: ApiLanguage): Promise<UserStats> {
  const { data } = await http.get<UserStats>('/stats', {
    headers: langHeaders(language),
  });
  return data;
}
