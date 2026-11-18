/**
 * Cryptographic constants and format specification for File Guard
 */

export const VAULT_MAGIC = new Uint8Array([0x46, 0x47, 0x56, 0x31]); // 'FGV1'
export const VAULT_MAGIC_STR = 'FGV1';
export const CURRENT_VAULT_VERSION = 1;

export const PBKDF2_ITERATIONS = 310000; // As required by security specification
export const PBKDF2_HASH = 'SHA-256';

export const SALT_BYTE_LENGTH = 16;  // 128-bit CSPRNG salt
export const NONCE_BYTE_LENGTH = 12; // 96-bit AES-GCM standard nonce

export const AES_KEY_LENGTH = 256;   // AES-256
export const GCM_TAG_LENGTH = 128;   // 16-byte authentication tag (in bits)
export const GCM_TAG_BYTE_LENGTH = 16;

export const MIN_VAULT_FILE_SIZE = 4 + 2 + 4 + SALT_BYTE_LENGTH + NONCE_BYTE_LENGTH + 2 + 2 + GCM_TAG_BYTE_LENGTH; // 58 bytes

