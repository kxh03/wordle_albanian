/**
 * Dictionary validation is performed exclusively by the Laravel API.
 * This module is kept only for backward compatibility with legacy imports.
 */
export function isDictionaryReady(): boolean {
  return true;
}

export async function ensureDictionaryLoaded(): Promise<void> {
  return Promise.resolve();
}
