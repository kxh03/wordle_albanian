import { http, AUTH_TOKEN_KEY } from '@/lib/http';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  preferred_language: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export async function registerApi(params: {
  name: string;
  email: string;
  password: string;
  preferred_language?: 'sq' | 'en';
}): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/register', params);
  return data;
}

export async function loginApi(params: {
  email: string;
  password: string;
  device_name?: string;
}): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/auth/login', params);
  return data;
}

export async function logoutApi(): Promise<void> {
  await http.post('/auth/logout');
}

export async function fetchMe(): Promise<{ user: AuthUser }> {
  const { data } = await http.get<{ user: AuthUser }>('/auth/me');
  return data;
}

export async function updateProfileApi(params: {
  name?: string;
  preferred_language?: 'sq' | 'en';
}): Promise<{ user: AuthUser }> {
  const { data } = await http.patch<{ user: AuthUser }>('/auth/profile', params);
  return data;
}
