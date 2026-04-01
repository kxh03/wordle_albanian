/**
 * Laravel API client for me llafe. Base URL defaults to Vite proxy path /api → backend.
 */
const DEFAULT_BASE = '/api';

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, '');
  }
  return DEFAULT_BASE;
}

export type ApiLanguage = 'sq' | 'en';

export function toApiLanguage(ui: 'albanian' | 'english'): ApiLanguage {
  return ui === 'english' ? 'en' : 'sq';
}

function headers(language: ApiLanguage): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Language': language,
  };
}

export type SubmitGuessResponse = {
  result: ('correct' | 'partial' | 'incorrect')[];
  is_win: boolean;
  target_word?: string;
};

export async function postGamesFree(language: ApiLanguage): Promise<{ target_token: string; language: string }> {
  const res = await fetch(`${getApiBase()}/games/free`, {
    method: 'POST',
    headers: headers(language),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function postGamesDaily(
  language: ApiLanguage,
  date: string
): Promise<{ target_token: string; date: string; language: string }> {
  const res = await fetch(`${getApiBase()}/games/daily`, {
    method: 'POST',
    headers: headers(language),
    body: JSON.stringify({ date }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function postGamesSubmit(params: {
  language: ApiLanguage;
  guess: string;
  targetToken: string;
  isLastRow: boolean;
}): Promise<SubmitGuessResponse> {
  const res = await fetch(`${getApiBase()}/games/submit`, {
    method: 'POST',
    headers: headers(params.language),
    body: JSON.stringify({
      guess: params.guess,
      target_token: params.targetToken,
      is_last_row: params.isLastRow,
    }),
  });
  if (res.status === 422) {
    throw Object.assign(new Error('Invalid dictionary word.'), { status: 422 });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function postDictionaryValidate(language: ApiLanguage, guess: string): Promise<boolean> {
  const res = await fetch(`${getApiBase()}/dictionary/validate`, {
    method: 'POST',
    headers: headers(language),
    body: JSON.stringify({ guess }),
  });
  if (!res.ok) {
    return false;
  }
  const data = (await res.json()) as { valid?: boolean };
  return Boolean(data.valid);
}

export async function getDictionaryMeta(): Promise<{ sq_count: number; en_count: number }> {
  const res = await fetch(`${getApiBase()}/dictionary/meta`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
