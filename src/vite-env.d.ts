/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** e.g. http://localhost:8000/api — omit to use Vite dev proxy `/api` */
  readonly VITE_API_URL?: string;
}
