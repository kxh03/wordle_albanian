// Albanian alphabet with special characters
export const ALBANIAN_ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'DH', 'E', 'Ë', 'F', 'G', 'GJ', 'H', 'I', 'J', 'K', 'L', 'LL', 'M', 'N', 'NJ', 'O', 'P', 'Q', 'R', 'RR', 'S', 'SH', 'T', 'TH', 'U', 'V', 'X', 'XH', 'Y', 'Z', 'ZH'
];

export const KEYBOARD_LAYOUT = [
  ['Q', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ë'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

// Sample Albanian words (you mentioned having a JSON file - we can replace this)
export const SAMPLE_WORDS = [
  'JETËS', 'DASHURI', 'MËNGJES', 'DRITË', 'ZEMËR', 'SHTËPI', 'FAMILJE', 'FËMIJË',
  'LIBËR', 'SHKOLLË', 'PUNË', 'KOHË', 'VERË', 'DIMËR', 'PRANVERË', 'VJESHTË',
  'UJËR', 'ZJARR', 'ERË', 'TOKË', 'HËNË', 'DIELL', 'YLL', 'QYJ', 'MALE'
];

export function getRandomWord(): string {
  return SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)];
}

export function normalizeAlbanian(text: string): string {
  // First normalize and uppercase
  let normalized = text.toUpperCase().normalize('NFC').trim();
  
  // Handle common Albanian character substitutions for keyboard input
  // This allows users to type E instead of Ë, C instead of Ç, etc.
  const substitutions: Record<string, string> = {
    'E': 'Ë', // Allow E to match Ë in dictionary
    'C': 'Ç'  // Allow C to match Ç in dictionary
  };
  
  // For validation, we'll try both the original and substituted versions
  return normalized;
}

// Helper function to get all possible variations of a word
export function getAlbanianVariations(text: string): string[] {
  const normalized = text.toUpperCase().normalize('NFC').trim();
  const variations = [normalized];
  
  // Add variations with Albanian character substitutions
  let withE = normalized.replace(/E/g, 'Ë');
  let withC = normalized.replace(/C/g, 'Ç');
  
  if (withE !== normalized) variations.push(withE);
  if (withC !== normalized) variations.push(withC);
  
  // Combination of both
  let withBoth = normalized.replace(/E/g, 'Ë').replace(/C/g, 'Ç');
  if (withBoth !== normalized && !variations.includes(withBoth)) {
    variations.push(withBoth);
  }
  
  return variations;
}

export function isValidAlbanianWord(word: string): boolean {
  const normalized = normalizeAlbanian(word);
  // For now, check if it's 5 letters and contains only Albanian characters
  if (normalized.length !== 5) return false;
  
  const validChars = new Set([...ALBANIAN_ALPHABET, 'DH', 'GJ', 'LL', 'NJ', 'RR', 'SH', 'TH', 'XH', 'ZH']);
  
  for (let char of normalized) {
    if (!validChars.has(char)) return false;
  }
  
  return true;
}