import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  encryptFile, 
  decryptVault, 
  unpackVault, 
  generateSalt, 
  generateNonce,
  DecryptionError,
  CURRENT_VAULT_VERSION
} from '../src/utils/crypto/index.js';

describe('File Guard Cryptographic Engine & Security Audit', () => {

  test('should generate fresh random 16-byte salt and 12-byte nonce every time', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    const nonce1 = generateNonce();
    const nonce2 = generateNonce();

    assert.equal(salt1.byteLength, 16);
    assert.equal(salt2.byteLength, 16);
    assert.equal(nonce1.byteLength, 12);
    assert.equal(nonce2.byteLength, 12);

    assert.notDeepEqual(salt1, salt2, 'Salts must be randomly generated and unique');
    assert.notDeepEqual(nonce1, nonce2, 'Nonces must be randomly generated and unique');
  });

  test('should successfully encrypt and decrypt a text file with 310,000 PBKDF2 iterations', async () => {
    const originalContent = 'CONFIDENTIAL_FINANCIAL_REPORT_Q4_2026';
    const textEncoder = new TextEncoder();
    const fileBytes = textEncoder.encode(originalContent);
    const password = 'SuperSecretMasterPassword!2026';

    const encryptResult = await encryptFile(fileBytes, password, {
      filename: 'financial_report.txt',
      mimeType: 'text/plain'
    });

    assert.ok(encryptResult.vaultBuffer);
    assert.equal(encryptResult.originalName, 'financial_report.txt');
    assert.equal(encryptResult.originalMimeType, 'text/plain');
    assert.equal(encryptResult.algorithm, 'AES-256-GCM');
    assert.ok(encryptResult.vaultBuffer.byteLength > fileBytes.byteLength);

    // Verify unpacking reads PBKDF2_ITERATIONS = 310000
    const unpacked = unpackVault(encryptResult.vaultBuffer);
    assert.equal(unpacked.iterations, 310000);
    assert.equal(unpacked.version, CURRENT_VAULT_VERSION);
    assert.equal(unpacked.filename, 'financial_report.txt');
    assert.equal(unpacked.mimeType, 'text/plain');

    // Decrypt
    const decryptResult = await decryptVault(encryptResult.vaultBuffer, password);
    const textDecoder = new TextDecoder();
    const decryptedText = textDecoder.decode(decryptResult.restoredBuffer);

    assert.equal(decryptedText, originalContent);
    assert.equal(decryptResult.filename, 'financial_report.txt');
    assert.equal(decryptResult.mimeType, 'text/plain');
    assert.equal(decryptResult.iterations, 310000);
    assert.equal(decryptResult.sha256, encryptResult.originalSha256);
  });

  test('should successfully encrypt and decrypt a PDF file with binary fidelity', async () => {
    // Generate realistic simulated PDF binary structure (%PDF-1.7 ... %%EOF)
    const pdfHeader = '%PDF-1.7\n1 0 obj\n<< /Title (Vault Protected Document) /Type /Catalog >>\nendobj\n';
    const pdfTrailer = 'xref\n0 2\n0000000000 65535 f \ntrailer\n<< /Size 2 >>\nstartxref\n120\n%%EOF';
    const randomBinaryBody = new Uint8Array(4096);
    for (let i = 0; i < randomBinaryBody.length; i++) {
      randomBinaryBody[i] = (i * 37) % 256;
    }
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(pdfHeader);
    const trailerBytes = encoder.encode(pdfTrailer);
    
    const pdfBytes = new Uint8Array(headerBytes.length + randomBinaryBody.length + trailerBytes.length);
    pdfBytes.set(headerBytes, 0);
    pdfBytes.set(randomBinaryBody, headerBytes.length);
    pdfBytes.set(trailerBytes, headerBytes.length + randomBinaryBody.length);

    const password = 'QuantumSecureVaultPassphrase#99';

    const encryptResult = await encryptFile(pdfBytes, password, {
      filename: 'contract_agreement.pdf',
      mimeType: 'application/pdf'
    });

    assert.equal(encryptResult.originalName, 'contract_agreement.pdf');
    assert.equal(encryptResult.originalMimeType, 'application/pdf');

    const decryptResult = await decryptVault(encryptResult.vaultBuffer, password);

    assert.equal(decryptResult.filename, 'contract_agreement.pdf');
    assert.equal(decryptResult.mimeType, 'application/pdf');
    assert.equal(decryptResult.size, pdfBytes.byteLength);
    assert.deepEqual(decryptResult.restoredBuffer, pdfBytes);
  });

  test('should successfully encrypt and decrypt a JPG image file with binary fidelity', async () => {
    // Generate realistic simulated JPEG binary (starts with 0xFFD8, ends with 0xFFD9)
    const jpgBytes = new Uint8Array(8192);
    jpgBytes[0] = 0xFF;
    jpgBytes[1] = 0xD8; // JPEG SOI marker
    jpgBytes[2] = 0xFF;
    jpgBytes[3] = 0xE0; // APP0 marker
    for (let i = 4; i < jpgBytes.length - 2; i++) {
      jpgBytes[i] = (i * 13 + 7) % 256;
    }
    jpgBytes[jpgBytes.length - 2] = 0xFF;
    jpgBytes[jpgBytes.length - 1] = 0xD9; // JPEG EOI marker

    const password = 'PhotoVaultSecretKey!44';

    const encryptResult = await encryptFile(jpgBytes, password, {
      filename: 'biometric_id_photo.jpg',
      mimeType: 'image/jpeg'
    });

    assert.equal(encryptResult.originalName, 'biometric_id_photo.jpg');
    assert.equal(encryptResult.originalMimeType, 'image/jpeg');

    const decryptResult = await decryptVault(encryptResult.vaultBuffer, password);

    assert.equal(decryptResult.filename, 'biometric_id_photo.jpg');
    assert.equal(decryptResult.mimeType, 'image/jpeg');
    assert.equal(decryptResult.size, jpgBytes.byteLength);
    assert.deepEqual(decryptResult.restoredBuffer, jpgBytes);
  });

  test('should successfully encrypt and decrypt an empty (0-byte) file', async () => {
    const emptyBytes = new Uint8Array(0);
    const password = 'EmptyFilePassword!12';

    const enc = await encryptFile(emptyBytes, password, {
      filename: 'empty.dat',
      mimeType: 'application/octet-stream'
    });

    assert.ok(enc.vaultBuffer.byteLength >= 58, 'Vault contains full header and GCM auth tag');
    const dec = await decryptVault(enc.vaultBuffer, password);
    assert.equal(dec.size, 0);
    assert.equal(dec.filename, 'empty.dat');
    assert.deepEqual(dec.restoredBuffer, emptyBytes);
  });

  test('should handle Unicode passphrases with NFC/NFD normalization correctly', async () => {
    const fileBytes = new TextEncoder().encode('SECRET_UNICODE_PAYLOAD');
    // 'café' in NFC (single char é) vs NFD (e + combining acute accent)
    const passwordNFC = 'caf\u00E9';
    const passwordNFD = 'cafe\u0301';

    assert.notEqual(passwordNFC, passwordNFD, 'NFC and NFD strings are bitwise different');

    // Encrypt with NFC
    const enc = await encryptFile(fileBytes, passwordNFC, { filename: 'cafe.txt' });

    // Decrypt with NFD (should succeed because keyDerivation normalizes to NFKC)
    const dec = await decryptVault(enc.vaultBuffer, passwordNFD);
    assert.equal(new TextDecoder().decode(dec.restoredBuffer), 'SECRET_UNICODE_PAYLOAD');
  });

  test('should fail decryption and throw clear error when password is incorrect', async () => {
    const fileBytes = new TextEncoder().encode('TOP_SECRET_INTELLIGENCE');
    const correctPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword999!';

    const encryptResult = await encryptFile(fileBytes, correctPassword, {
      filename: 'secrets.txt',
      mimeType: 'text/plain'
    });

    await assert.rejects(
      async () => {
        await decryptVault(encryptResult.vaultBuffer, wrongPassword);
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'AUTH_TAG_FAILED');
        assert.match(err.message, /Authentication Failed: Incorrect password/i);
        return true;
      }
    );
  });

  test('should detect tampering in ciphertext and fail authentication', async () => {
    const fileBytes = new TextEncoder().encode('TRANSACTION_AMOUNT=$1,000,000');
    const password = 'BankGradePassword!77';

    const encryptResult = await encryptFile(fileBytes, password, {
      filename: 'wire_transfer.dat',
      mimeType: 'application/octet-stream'
    });

    // Flip 1 bit in ciphertext
    const tamperedBuffer = new Uint8Array(encryptResult.vaultBuffer);
    const lastByteIndex = tamperedBuffer.byteLength - 5;
    tamperedBuffer[lastByteIndex] ^= 0x01;

    await assert.rejects(
      async () => {
        await decryptVault(tamperedBuffer, password);
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'AUTH_TAG_FAILED');
        assert.match(err.message, /tampered with or corrupted/i);
        return true;
      }
    );
  });

  test('should detect tampering in the AES-GCM authentication tag', async () => {
    const fileBytes = new TextEncoder().encode('UNMODIFIABLE_PAYLOAD');
    const password = 'AuthTagTestPassword!12';

    const encryptResult = await encryptFile(fileBytes, password, {
      filename: 'tag_test.bin'
    });

    // The last 16 bytes of the vault are the GCM authentication tag
    const tamperedVault = new Uint8Array(encryptResult.vaultBuffer);
    tamperedVault[tamperedVault.length - 1] ^= 0xFF;

    await assert.rejects(
      async () => {
        await decryptVault(tamperedVault, password);
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'AUTH_TAG_FAILED');
        return true;
      }
    );
  });

  test('should detect tampering in header metadata (filename) and fail authentication via AAD', async () => {
    const fileBytes = new TextEncoder().encode('PAYLOAD_PROTECTED_BY_AAD');
    const password = 'HeaderTamperPassword!1';

    const encryptResult = await encryptFile(fileBytes, password, {
      filename: 'invoice.pdf',
      mimeType: 'application/pdf'
    });

    // Tamper the filename in the header (change 'invoice.pdf' to 'invoicx.pdf')
    const tamperedVault = new Uint8Array(encryptResult.vaultBuffer);
    // Find index of 'invoice.pdf' in header
    const invoiceIndex = encryptResult.vaultBuffer.indexOf(0x69); // 'i'
    assert.ok(invoiceIndex !== -1 && invoiceIndex < 50);
    tamperedVault[invoiceIndex + 6] = 0x78; // change 'e' to 'x'

    await assert.rejects(
      async () => {
        await decryptVault(tamperedVault, password);
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'AUTH_TAG_FAILED');
        return true;
      }
    );
  });

  test('should sanitize malicious filenames with path traversal attempts', () => {
    const headerBytes = new Uint8Array(100);
    const dataView = new DataView(headerBytes.buffer);
    
    // Construct mock vault with filename containing path traversal
    headerBytes.set([0x46, 0x47, 0x56, 0x31], 0); // FGV1
    dataView.setUint16(4, 1, false); // version 1
    dataView.setUint32(6, 310000, false); // iterations
    // salt (16B), nonce (12B)
    const filename = '../../../../etc/shadow';
    const enc = new TextEncoder();
    const fnBytes = enc.encode(filename);
    dataView.setUint16(38, fnBytes.byteLength, false);
    headerBytes.set(fnBytes, 40);
    let offset = 40 + fnBytes.byteLength;
    dataView.setUint16(offset, 0, false); // mime len 0
    offset += 2;
    // Append 16 dummy cipher bytes
    const fullMock = new Uint8Array(offset + 16);
    fullMock.set(headerBytes.slice(0, offset), 0);

    const unpacked = unpackVault(fullMock);
    assert.equal(unpacked.filename, 'shadow', 'Path traversal characters must be stripped');
  });

  test('should reject invalid file format (wrong magic bytes)', async () => {
    const fakeData = new Uint8Array(100);
    fakeData[0] = 0x58; // 'X'
    fakeData[1] = 0x58; // 'X'
    fakeData[2] = 0x58; // 'X'
    fakeData[3] = 0x58; // 'X'

    await assert.rejects(
      async () => {
        await decryptVault(fakeData, 'AnyPassword123');
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'INVALID_FORMAT');
        assert.match(err.message, /Expected signature "FGV1"/);
        return true;
      }
    );
  });

  test('should reject files that are too small or truncated', async () => {
    const tinyBuffer = new Uint8Array([0x46, 0x47, 0x56, 0x31, 0x00, 0x01]);

    await assert.rejects(
      async () => {
        await decryptVault(tinyBuffer, 'AnyPassword123');
      },
      (err) => {
        assert.ok(err instanceof DecryptionError);
        assert.equal(err.code, 'INVALID_FORMAT');
        assert.match(err.message, /File is too small/);
        return true;
      }
    );
  });

  test('should produce different ciphertexts for the exact same file and password (fresh IV & salt)', async () => {
    const fileBytes = new TextEncoder().encode('DETERMINISM_PREVENTION_TEST');
    const password = 'IdenticalPassword!123';

    const enc1 = await encryptFile(fileBytes, password, { filename: 'test.txt' });
    const enc2 = await encryptFile(fileBytes, password, { filename: 'test.txt' });

    assert.notDeepEqual(enc1.vaultBuffer, enc2.vaultBuffer, 'Two encryptions of the same file must yield completely different ciphertexts');

    // Both should still decrypt to the exact same plaintext
    const dec1 = await decryptVault(enc1.vaultBuffer, password);
    const dec2 = await decryptVault(enc2.vaultBuffer, password);
    assert.deepEqual(dec1.restoredBuffer, dec2.restoredBuffer);
  });
});
