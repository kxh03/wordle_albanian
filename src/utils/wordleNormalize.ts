/**
 * Matches Laravel WordNormalizationService: Ë→E, Ç→C for fair comparisons.
 */
export function normalizeForWordleMatch(text: string): string {
  const upper = text.toUpperCase().normalize('NFC').trim();
  return upper.replace(/Ë/g, 'E').replace(/Ç/g, 'C');
}
