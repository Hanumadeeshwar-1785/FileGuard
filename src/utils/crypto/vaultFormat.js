import { 
  VAULT_MAGIC, 
  VAULT_MAGIC_STR, 
  CURRENT_VAULT_VERSION, 
  SALT_BYTE_LENGTH, 
  NONCE_BYTE_LENGTH, 
  MIN_VAULT_FILE_SIZE,
  GCM_TAG_BYTE_LENGTH
} from './constants.js';

export class VaultFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VaultFormatError';
  }
}

/**
 * Creates the binary header of a .fgvault container
 * 
 * Layout:
 * [0..3]   Magic Bytes 'FGV1' (4 bytes)
 * [4..5]   Version uint16 (2 bytes, big-endian)
 * [6..9]   PBKDF2 Iteration count uint32 (4 bytes, big-endian)
 * [10..25] Salt (16 bytes)
 * [26..37] Nonce IV (12 bytes)
 * [38..39] Filename byte length uint16 (2 bytes, big-endian)
 * [40..40+L_f-1] Original filename UTF-8 bytes (L_f bytes)
 * [Offset..Offset+1] MIME type byte length uint16 (2 bytes, big-endian)
 * [Offset+2..Offset+1+L_m] Original MIME type UTF-8 bytes (L_m bytes)
 * 
 * @param {Object} params
 * @param {number} [params.version=1]
 * @param {string} params.filename
 * @param {string} [params.mimeType='application/octet-stream']
 * @param {number} params.iterations
 * @param {Uint8Array} params.salt
 * @param {Uint8Array} params.nonce
 * @returns {Uint8Array} Header binary bytes
 */
export function createVaultHeader({
  version = CURRENT_VAULT_VERSION,
  filename,
  mimeType = 'application/octet-stream',
  iterations,
  salt,
  nonce
}) {
  if (!filename || typeof filename !== 'string') {
    throw new VaultFormatError('Filename string is required to construct vault header.');
  }
  if (!salt || !(salt instanceof Uint8Array) || salt.byteLength !== SALT_BYTE_LENGTH) {
    throw new VaultFormatError(`Salt must be a Uint8Array of exactly ${SALT_BYTE_LENGTH} bytes.`);
  }
  if (!nonce || !(nonce instanceof Uint8Array) || nonce.byteLength !== NONCE_BYTE_LENGTH) {
    throw new VaultFormatError(`Nonce must be a Uint8Array of exactly ${NONCE_BYTE_LENGTH} bytes.`);
  }
  if (typeof iterations !== 'number' || iterations <= 0 || !Number.isInteger(iterations)) {
    throw new VaultFormatError('PBKDF2 iterations must be a positive integer.');
  }

  const encoder = new TextEncoder();
  const filenameBytes = encoder.encode(filename);
  const mimeBytes = encoder.encode(mimeType || 'application/octet-stream');

  if (filenameBytes.byteLength > 65535) {
    throw new VaultFormatError('Filename exceeds maximum supported length (65535 bytes).');
  }
  if (mimeBytes.byteLength > 65535) {
    throw new VaultFormatError('MIME type exceeds maximum supported length (65535 bytes).');
  }

  const headerLength = 
    4 + // magic
    2 + // version
    4 + // iterations
    SALT_BYTE_LENGTH + // salt (16)
    NONCE_BYTE_LENGTH + // nonce (12)
    2 + filenameBytes.byteLength + // filename length + bytes
    2 + mimeBytes.byteLength; // mime length + bytes

  const header = new Uint8Array(headerLength);
  const dataView = new DataView(header.buffer);
  let offset = 0;

  // 1. Magic signature
  header.set(VAULT_MAGIC, offset);
  offset += 4;

  // 2. Version
  dataView.setUint16(offset, version, false); // Big-endian
  offset += 2;

  // 3. Iterations
  dataView.setUint32(offset, iterations, false);
  offset += 4;

  // 4. Salt
  header.set(salt, offset);
  offset += SALT_BYTE_LENGTH;

  // 5. Nonce
  header.set(nonce, offset);
  offset += NONCE_BYTE_LENGTH;

  // 6. Filename
  dataView.setUint16(offset, filenameBytes.byteLength, false);
  offset += 2;
  header.set(filenameBytes, offset);
  offset += filenameBytes.byteLength;

  // 7. MIME type
  dataView.setUint16(offset, mimeBytes.byteLength, false);
  offset += 2;
  header.set(mimeBytes, offset);
  offset += mimeBytes.byteLength;

  return header;
}

/**
 * Packages encrypted payload and cryptographic metadata into a versioned .fgvault binary buffer
 * 
 * @param {Object} params
 * @param {number} [params.version=1]
 * @param {string} params.filename
 * @param {string} [params.mimeType='application/octet-stream']
 * @param {number} params.iterations
 * @param {Uint8Array} params.salt
 * @param {Uint8Array} params.nonce
 * @param {ArrayBuffer|Uint8Array} params.ciphertextWithTag
 * @returns {Uint8Array} Packed vault binary
 */
export function packVault({
  version = CURRENT_VAULT_VERSION,
  filename,
  mimeType = 'application/octet-stream',
  iterations,
  salt,
  nonce,
  ciphertextWithTag
}) {
  if (!ciphertextWithTag) {
    throw new VaultFormatError('Ciphertext data is required to pack a vault.');
  }

  const headerBytes = createVaultHeader({
    version,
    filename,
    mimeType,
    iterations,
    salt,
    nonce
  });

  const cipherBytes = ciphertextWithTag instanceof Uint8Array 
    ? ciphertextWithTag 
    : new Uint8Array(ciphertextWithTag);

  const totalLength = headerBytes.byteLength + cipherBytes.byteLength;
  const buffer = new Uint8Array(totalLength);
  buffer.set(headerBytes, 0);
  buffer.set(cipherBytes, headerBytes.byteLength);

  return buffer;
}

/**
 * Parses and validates a .fgvault container buffer
 * 
 * @param {ArrayBuffer|Uint8Array} vaultBuffer
 * @returns {Object} Unpacked vault parameters with header bytes for AAD authentication
 */
export function unpackVault(vaultBuffer) {
  if (!vaultBuffer) {
    throw new VaultFormatError('No vault data provided.');
  }

  const bytes = vaultBuffer instanceof Uint8Array 
    ? vaultBuffer 
    : new Uint8Array(vaultBuffer);

  if (bytes.byteLength < MIN_VAULT_FILE_SIZE) {
    throw new VaultFormatError('Invalid file format: File is too small to be a valid .fgvault vault.');
  }

  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;

  // 1. Verify Magic Signature
  const magic = String.fromCharCode(...bytes.slice(0, 4));
  if (magic !== VAULT_MAGIC_STR) {
    throw new VaultFormatError(`Invalid file format: Expected signature "${VAULT_MAGIC_STR}", but found "${magic}".`);
  }
  offset += 4;

  // 2. Check Version
  const version = dataView.getUint16(offset, false);
  offset += 2;
  if (version !== CURRENT_VAULT_VERSION) {
    throw new VaultFormatError(`Unsupported vault version: Version ${version} is not supported by this app (current: ${CURRENT_VAULT_VERSION}).`);
  }

  // 3. Iterations
  const iterations = dataView.getUint32(offset, false);
  offset += 4;
  if (iterations < 1000 || iterations > 50000000) {
    throw new VaultFormatError('Corrupted vault header: Invalid iteration count.');
  }

  // 4. Salt (16 bytes)
  const salt = bytes.slice(offset, offset + SALT_BYTE_LENGTH);
  offset += SALT_BYTE_LENGTH;

  // 5. Nonce (12 bytes)
  const nonce = bytes.slice(offset, offset + NONCE_BYTE_LENGTH);
  offset += NONCE_BYTE_LENGTH;

  // 6. Filename
  if (offset + 2 > bytes.byteLength) {
    throw new VaultFormatError('Corrupted vault: Unexpected end of header while reading filename length.');
  }
  const filenameLen = dataView.getUint16(offset, false);
  offset += 2;

  if (offset + filenameLen > bytes.byteLength) {
    throw new VaultFormatError('Corrupted vault: Unexpected end of header while reading filename.');
  }
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let filename = '';
  try {
    filename = decoder.decode(bytes.slice(offset, offset + filenameLen));
  } catch {
    throw new VaultFormatError('Corrupted vault: Invalid UTF-8 filename encoding.');
  }
  offset += filenameLen;

  // Path traversal defense: strip any malicious directory prefixes
  const sanitizedFilename = filename.replace(/^.*[\\/]/, '').replace(/\0/g, '').trim() || 'restored_file';

  // 7. MIME type
  if (offset + 2 > bytes.byteLength) {
    throw new VaultFormatError('Corrupted vault: Unexpected end of header while reading MIME type length.');
  }
  const mimeLen = dataView.getUint16(offset, false);
  offset += 2;

  if (offset + mimeLen > bytes.byteLength) {
    throw new VaultFormatError('Corrupted vault: Unexpected end of header while reading MIME type.');
  }
  let mimeType = 'application/octet-stream';
  try {
    mimeType = decoder.decode(bytes.slice(offset, offset + mimeLen)) || 'application/octet-stream';
  } catch {
    throw new VaultFormatError('Corrupted vault: Invalid UTF-8 MIME type encoding.');
  }
  offset += mimeLen;

  // 8. Capture exact header bytes for AAD integrity verification
  const headerBytes = bytes.slice(0, offset);

  // 9. Ciphertext with Auth Tag
  const ciphertextWithTag = bytes.slice(offset);
  if (ciphertextWithTag.byteLength < GCM_TAG_BYTE_LENGTH) {
    throw new VaultFormatError('Corrupted vault: Ciphertext data is missing or truncated.');
  }

  return {
    version,
    iterations,
    salt,
    nonce,
    filename: sanitizedFilename,
    rawFilename: filename,
    mimeType,
    headerBytes,
    ciphertextWithTag
  };
}
