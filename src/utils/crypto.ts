// Lightweight client-side encryption to obscure shared-game payloads.
// Note: On a purely client-side app this cannot provide perfect secrecy,
// but it prevents trivial Base64 decoding of the word.

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

// Static app secret (32 bytes via SHA-256 of a fixed phrase)
// This is only obfuscation, not true security without a backend.
const APP_SECRET_BYTES = async (): Promise<CryptoKey> => {
  const seed = TEXT_ENCODER.encode('me-llafe-shared-game-secret-v1');
  const hash = await crypto.subtle.digest('SHA-256', seed);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
};

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function encryptPayload(payload: unknown): Promise<string> {
  const key = await APP_SECRET_BYTES();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = TEXT_ENCODER.encode(JSON.stringify(payload));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return `v1.${toBase64Url(iv)}.${toBase64Url(cipher)}`;
}

export async function decryptPayload(token: string): Promise<unknown | null> {
  try {
    const [v, ivB64, cipherB64] = token.split('.');
    if (v !== 'v1') return null;
    const key = await APP_SECRET_BYTES();
    const iv = new Uint8Array(fromBase64Url(ivB64));
    const cipherBuf = fromBase64Url(cipherB64);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf);
    const json = TEXT_DECODER.decode(plainBuf);
    return JSON.parse(json);
  } catch {
    return null;
  }
}


