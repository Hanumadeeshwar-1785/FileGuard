import { PBKDF2_ITERATIONS } from './constants.js';
import { 
  getSubtleCrypto, 
  generateSalt, 
  generateNonce, 
  deriveKeyFromPassword, 
  computeSha256 
} from './keyDerivation.js';
import { createVaultHeader } from './vaultFormat.js';

/**
 * Encrypts a file or ArrayBuffer into a .fgvault container
 * 
 * @param {File|Blob|ArrayBuffer|Uint8Array} fileInput - The file or binary data to encrypt
 * @param {string} password - User master passphrase (never persisted)
 * @param {Object} [options]
 * @param {string} [options.filename] - Custom filename override
 * @param {string} [options.mimeType] - Custom MIME type override
 * @param {Function} [options.onProgress] - Callback (percent: number, statusText: string)
 * @returns {Promise<Object>} Encryption result metadata & vault Blob
 */
export async function encryptFile(fileInput, password, options = {}) {
  const { onProgress = () => {} } = options;

  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('A valid master password is required to encrypt the file.');
  }

  // 1. Read input data to ArrayBuffer
  onProgress(10, 'Reading file contents into volatile memory...');
  let fileBuffer;
  let filename = options.filename;
  let mimeType = options.mimeType;

  if (typeof File !== 'undefined' && fileInput instanceof File) {
    filename = filename || fileInput.name;
    mimeType = mimeType || fileInput.type || 'application/octet-stream';
    fileBuffer = await fileInput.arrayBuffer();
  } else if (typeof Blob !== 'undefined' && fileInput instanceof Blob) {
    filename = filename || 'unnamed_file';
    mimeType = mimeType || fileInput.type || 'application/octet-stream';
    fileBuffer = await fileInput.arrayBuffer();
  } else if (fileInput instanceof ArrayBuffer) {
    filename = filename || 'unnamed_file';
    mimeType = mimeType || 'application/octet-stream';
    fileBuffer = fileInput;
  } else if (fileInput instanceof Uint8Array) {
    filename = filename || 'unnamed_file';
    mimeType = mimeType || 'application/octet-stream';
    fileBuffer = fileInput.buffer.slice(
      fileInput.byteOffset, 
      fileInput.byteOffset + fileInput.byteLength
    );
  } else {
    throw new Error('Unsupported file input format. Please provide a File, Blob, or ArrayBuffer.');
  }

  if (!filename) {
    filename = 'secured_file';
  }

  // 2. Compute original checksum for audit display
  onProgress(20, 'Calculating SHA-256 integrity digest...');
  const originalSha256 = await computeSha256(fileBuffer);

  // 3. Generate fresh 16-byte random salt and 12-byte random nonce
  onProgress(35, 'Generating fresh 16-byte salt and 12-byte AES-GCM nonce...');
  const salt = generateSalt();
  const nonce = generateNonce();

  // 4. Derive AES-256-GCM key with PBKDF2 (310,000 iterations)
  onProgress(50, `Deriving AES-256 key via PBKDF2 (${PBKDF2_ITERATIONS.toLocaleString()} iterations)...`);
  const derivedKey = await deriveKeyFromPassword(password, salt, PBKDF2_ITERATIONS);

  // 5. Construct Vault Header
  onProgress(65, 'Constructing authenticated container header...');
  const headerBytes = createVaultHeader({
    version: 1,
    filename,
    mimeType: mimeType || 'application/octet-stream',
    iterations: PBKDF2_ITERATIONS,
    salt,
    nonce
  });

  // 6. Encrypt with AES-GCM-256, binding the entire header as Authenticated Associated Data (AAD)
  onProgress(80, 'Executing AES-256-GCM authenticated encryption...');
  const subtle = getSubtleCrypto();
  const ciphertextBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      additionalData: headerBytes,
      tagLength: 128
    },
    derivedKey,
    fileBuffer
  );

  // 7. Package complete vault binary: Header + CiphertextWithTag
  onProgress(90, 'Packaging versioned .fgvault envelope...');
  const cipherBytes = new Uint8Array(ciphertextBuffer);
  const totalLength = headerBytes.byteLength + cipherBytes.byteLength;
  const vaultBytes = new Uint8Array(totalLength);
  vaultBytes.set(headerBytes, 0);
  vaultBytes.set(cipherBytes, headerBytes.byteLength);

  const vaultSha256 = await computeSha256(vaultBytes);
  const vaultName = `${filename}.fgvault`;
  
  // Safe Blob creation
  const vaultBlob = typeof Blob !== 'undefined'
    ? new Blob([vaultBytes], { type: 'application/octet-stream' })
    : null;

  onProgress(100, 'File secured successfully!');

  return {
    vaultBlob,
    vaultBuffer: vaultBytes,
    vaultName,
    originalName: filename,
    originalMimeType: mimeType,
    originalSize: fileBuffer.byteLength,
    vaultSize: vaultBytes.byteLength,
    originalSha256,
    vaultSha256,
    algorithm: 'AES-256-GCM',
    kdf: `PBKDF2-HMAC-SHA256 (${PBKDF2_ITERATIONS.toLocaleString()} iterations)`,
    timestamp: new Date().toISOString()
  };
}
