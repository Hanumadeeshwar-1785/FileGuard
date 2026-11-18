import { 
  PBKDF2_ITERATIONS, 
  PBKDF2_HASH, 
  SALT_BYTE_LENGTH, 
  NONCE_BYTE_LENGTH, 
  AES_KEY_LENGTH 
} from './constants.js';

/**
 * Returns the subtle crypto instance from environment (browser or Node.js)
 */
export function getSubtleCrypto() {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available in this environment.');
  }
  return cryptoObj.subtle;
}

/**
 * Generates cryptographically secure random bytes
 */
export function generateRandomBytes(length) {
  if (typeof length !== 'number' || length <= 0 || !Number.isInteger(length)) {
    throw new Error('Length must be a positive integer.');
  }
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (!cryptoObj || !cryptoObj.getRandomValues) {
    throw new Error('Web Crypto API (crypto.getRandomValues) is not available in this environment.');
  }
  const bytes = new Uint8Array(length);
  cryptoObj.getRandomValues(bytes);
  return bytes;
}

/**
 * Generates a fresh 16-byte random salt for PBKDF2
 */
export function generateSalt() {
  return generateRandomBytes(SALT_BYTE_LENGTH);
}

/**
 * Generates a fresh 12-byte random nonce for AES-GCM
 */
export function generateNonce() {
  return generateRandomBytes(NONCE_BYTE_LENGTH);
}

/**
 * Derives an AES-GCM-256 CryptoKey from a user password and salt using PBKDF2-HMAC-SHA256
 * 
 * @param {string} password - User provided passphrase (never stored)
 * @param {Uint8Array} salt - 16-byte cryptographic salt
 * @param {number} [iterations=310000] - Number of PBKDF2 iterations
 * @returns {Promise<CryptoKey>} - Derived AES-GCM key
 */
export async function deriveKeyFromPassword(password, salt, iterations = PBKDF2_ITERATIONS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('A valid non-empty password string is required for key derivation.');
  }
  if (!salt || !(salt instanceof Uint8Array) || salt.byteLength !== SALT_BYTE_LENGTH) {
    throw new Error(`Salt must be a Uint8Array of exactly ${SALT_BYTE_LENGTH} bytes.`);
  }
  if (typeof iterations !== 'number' || iterations <= 0 || !Number.isInteger(iterations)) {
    throw new Error('PBKDF2 iteration count must be a positive integer.');
  }

  const subtle = getSubtleCrypto();
  const encoder = new TextEncoder();
  // Normalize Unicode password to NFKC to ensure consistent cross-platform passphrase comparison
  const normalizedPassword = password.normalize('NFKC');
  const passwordBuffer = encoder.encode(normalizedPassword);

  // 1. Import raw password material
  const keyMaterial = await subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // 2. Derive 256-bit AES-GCM key
  const derivedKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: PBKDF2_HASH
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH
    },
    false, // Key is non-extractable from memory
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Computes a SHA-256 hex digest of an ArrayBuffer or Uint8Array
 */
export async function computeSha256(buffer) {
  const subtle = getSubtleCrypto();
  const hashBuffer = await subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
