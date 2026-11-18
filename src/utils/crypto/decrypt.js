import { getSubtleCrypto, deriveKeyFromPassword, computeSha256 } from './keyDerivation.js';
import { unpackVault, VaultFormatError } from './vaultFormat.js';

export class DecryptionError extends Error {
  constructor(message, code = 'DECRYPTION_FAILED') {
    super(message);
    this.name = 'DecryptionError';
    this.code = code;
  }
}

/**
 * Decrypts a .fgvault container back into the original unencrypted file
 * 
 * @param {File|Blob|ArrayBuffer|Uint8Array} vaultInput - The .fgvault file or binary data
 * @param {string} password - User master passphrase
 * @param {Object} [options]
 * @param {Function} [options.onProgress] - Callback (percent: number, statusText: string)
 * @returns {Promise<Object>} Restored file metadata & decrypted Blob
 */
export async function decryptVault(vaultInput, password, options = {}) {
  const { onProgress = () => {} } = options;

  if (typeof password !== 'string' || password.length === 0) {
    throw new DecryptionError('A master password is required to decrypt the vault.', 'EMPTY_PASSWORD');
  }

  // 1. Read input vault data to ArrayBuffer
  onProgress(10, 'Reading .fgvault binary envelope...');
  let vaultBuffer;

  if (typeof File !== 'undefined' && vaultInput instanceof File) {
    vaultBuffer = await vaultInput.arrayBuffer();
  } else if (typeof Blob !== 'undefined' && vaultInput instanceof Blob) {
    vaultBuffer = await vaultInput.arrayBuffer();
  } else if (vaultInput instanceof ArrayBuffer) {
    vaultBuffer = vaultInput;
  } else if (vaultInput instanceof Uint8Array) {
    vaultBuffer = vaultInput.buffer.slice(
      vaultInput.byteOffset,
      vaultInput.byteOffset + vaultInput.byteLength
    );
  } else {
    throw new DecryptionError('Unsupported input format. Expected a .fgvault File, Blob, or ArrayBuffer.', 'INVALID_INPUT');
  }

  // 2. Validate and unpack the .fgvault format
  onProgress(25, 'Validating magic header, version, and cryptographic parameters...');
  let unpacked;
  try {
    unpacked = unpackVault(vaultBuffer);
  } catch (err) {
    if (err instanceof VaultFormatError) {
      throw new DecryptionError(err.message, 'INVALID_FORMAT');
    }
    throw new DecryptionError(`Failed to parse vault format: ${err.message}`, 'CORRUPTED_CONTAINER');
  }

  const {
    version,
    iterations,
    salt,
    nonce,
    filename,
    mimeType,
    headerBytes,
    ciphertextWithTag
  } = unpacked;

  // 3. Derive key from password using stored salt and iteration count
  onProgress(50, `Deriving AES-256 decryption key via PBKDF2 (${iterations.toLocaleString()} iterations)...`);
  let derivedKey;
  try {
    derivedKey = await deriveKeyFromPassword(password, salt, iterations);
  } catch (err) {
    throw new DecryptionError(`Key derivation failed: ${err.message}`, 'KDF_FAILED');
  }

  // 4. Decrypt with AES-GCM and verify both ciphertext and header metadata via AAD
  onProgress(75, 'Verifying 128-bit GMAC authentication tag & decrypting...');
  const subtle = getSubtleCrypto();
  let decryptedBuffer;

  try {
    decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        additionalData: headerBytes,
        tagLength: 128
      },
      derivedKey,
      ciphertextWithTag
    );
  } catch {
    // WebCrypto subtle.decrypt throws OperationError if tag mismatch occurs (wrong password or altered ciphertext/metadata)
    throw new DecryptionError(
      'Authentication Failed: Incorrect password or the encrypted file has been tampered with or corrupted.',
      'AUTH_TAG_FAILED'
    );
  }

  // 5. Compute SHA-256 of restored file
  onProgress(90, 'Restoring original filename and MIME type stream...');
  const decryptedBytes = new Uint8Array(decryptedBuffer);
  const restoredSha256 = await computeSha256(decryptedBytes);

  // Create restored Blob
  const restoredBlob = typeof Blob !== 'undefined'
    ? new Blob([decryptedBytes], { type: mimeType || 'application/octet-stream' })
    : null;

  onProgress(100, 'File decrypted and verified successfully!');

  return {
    restoredBlob,
    restoredBuffer: decryptedBytes,
    filename,
    mimeType,
    size: decryptedBytes.byteLength,
    sha256: restoredSha256,
    version,
    iterations,
    algorithm: 'AES-256-GCM',
    timestamp: new Date().toISOString()
  };
}
