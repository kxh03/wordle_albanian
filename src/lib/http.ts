import axios from 'axios';
import { getApiBase } from '@/lib/api';

export const AUTH_TOKEN_KEY = 'me_llafe_auth_token';

export const http = axios.create({
  baseURL: getApiBase(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(err);
  }
);
