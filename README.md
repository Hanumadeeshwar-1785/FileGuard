# File Guard

> **Project Title:** File Encryption and Decryption System – Secure File Storage Application  
> **Platform:** Android-First Mobile Web Application  
> **Technologies:** React.js 19, Vite 8, JavaScript (ES2024), CSS3, Web Cryptography API (`crypto.subtle`), React Router v7, Lucide Icons  

---

## 🛡️ Overview

**File Guard** is an Android-first cybersecurity application implementing real, hardware-accelerated, client-side file encryption and decryption using the W3C **Web Cryptography API**.

It packages encrypted files into a versioned binary container format with the **`.fgvault`** extension, secured with authenticated symmetric encryption (**AES-256-GCM**) and key derivation (**PBKDF2-HMAC-SHA256 with 310,000 iterations**).

---

## 🔒 Security Specifications

1. **Web Crypto API:** All cryptographic operations execute via native `crypto.subtle` (no third-party crypto bloat or insecure pure-JS crypto libraries).
2. **AES-256-GCM:** Galois/Counter Mode authenticated encryption providing both data confidentiality and cryptographic integrity verification with a 128-bit authentication tag.
3. **Key Derivation (PBKDF2-HMAC-SHA256):** Converts human passphrases into cryptographically strong 256-bit AES master keys.
4. **310,000 Iterations:** Strictly adheres to OWASP recommended iteration thresholds for PBKDF2 with SHA-256.
5. **Fresh 16-Byte CSPRNG Salt:** Every encryption generates a unique 16-byte random salt (`crypto.getRandomValues`) to prevent rainbow table attacks.
6. **Fresh 12-Byte Nonce / IV:** Every encryption generates a unique 12-byte random initialization vector to ensure ciphertext non-determinism.
7. **Zero Hardcoded Keys or Passwords:** Passwords and keys exist exclusively in volatile RAM during active cryptographic execution.
8. **No Secrets in Storage:** Passwords and encryption keys are **never** stored in `localStorage`, cookies, or indexedDB.
9. **No Unencrypted File Retention:** Original unencrypted file payloads are **never** saved in session or application history.

---

## 📦 Versioned `.fgvault` Container Specification

The `.fgvault` file format is a self-contained, tamper-evident binary envelope:

| Offset (Bytes) | Field | Type | Description |
|---|---|---|---|
| `0..3` | Magic Header | ASCII (`FGV1`) | File Guard Vault signature (`0x46 0x47 0x56 0x31`) |
| `4..5` | Format Version | `uint16` (big-endian) | Format version (currently `1`) |
| `6..9` | PBKDF2 Iterations | `uint32` (big-endian) | Iteration count (`310000`) |
| `10..25` | Salt | Binary (16 bytes) | Fresh cryptographic salt for PBKDF2 |
| `26..37` | Nonce IV | Binary (12 bytes) | Fresh AES-GCM 96-bit initialization vector |
| `38..39` | Filename Length ($L_f$) | `uint16` (big-endian) | Byte length of original filename |
| `40..(40 + L_f - 1)` | Original Filename | UTF-8 String | Preserved original filename |
| `Offset..Offset + 1` | MIME Type Length ($L_m$) | `uint16` (big-endian) | Byte length of original MIME type |
| `Offset + 2..Offset + 1 + L_m` | Original MIME Type | UTF-8 String | Preserved original MIME type (e.g. `application/pdf`, `image/jpeg`) |
| `Remaining Bytes` | Ciphertext + Auth Tag | Binary Payload | AES-256-GCM ciphertext ending with the 16-byte GMAC authentication tag |

---

## 📱 Application Screens

1. **Splash Screen (`/` or `/splash`)**
   - File Guard shield logo with glowing pulse animation.
   - Subtitle: *"Secure Your Files"*.
   - Security chips and *"Enter Secure Vault"* button.

2. **Home Screen (`/home`)**
   - Active Vault greeting and hardware-accelerated security status banner.
   - Quick Action buttons: **Encrypt File** and **Decrypt File**.
   - Security Status grid (AES-256-GCM, PBKDF2-SHA256, Client-Side Only, GMAC Auth Tag).
   - Recently processed files list with status badges and detail inspector modal.

3. **Encrypt File Screen (`/encrypt`)**
   - File picker and drag-and-drop zone (supports PDF, JPG, PNG, DOCX, ZIP, etc.).
   - Displays selected filename and formatted size.
   - Master password with show/hide toggle and dynamic entropy/strength meter.
   - Confirm password with live matching validation.
   - Real-time progress bar with multi-stage cryptographic pipeline.
   - Exports the encrypted file with the `.fgvault` extension.

4. **Decrypt File Screen (`/decrypt`)**
   - Dedicated `.fgvault` file picker.
   - Master password input with show/hide toggle.
   - Real-time decryption status and progress indicator.
   - Restores original file with original filename, MIME type, and SHA-256 verification.
   - Clear error handling for incorrect passwords, corrupted files, and tampered tags.

5. **File History Screen (`/history`)**
   - Searchable audit log of encrypted and decrypted file activities.
   - Category filter tabs (**All**, **Encrypted**, **Decrypted**).
   - Detail modal showing file size, timestamp, cipher algorithm, and SHA-256 checksum.

6. **Security Information Screen (`/security`)**
   - Deep dive into **AES-256-GCM**, **PBKDF2 & SHA-256 (310,000 iterations)**, and **Password-Based Encryption**.
   - Interactive 4-step cryptographic pipeline diagram.
   - Technical specification tables.

7. **About Screen (`/about`)**
   - Application Name: **File Guard**.
   - Project Title: **File Encryption and Decryption System – Secure File Storage Application**.
   - Full technology stack breakdown and security guarantees.

---

## 🧪 Testing

The cryptographic engine includes a test suite covering all security scenarios:

```bash
npm test
```

### Verified Test Cases:
1. Fresh random 16-byte salt and 12-byte nonce on every encryption.
2. Successful encryption and decryption of text files with 310,000 PBKDF2 iterations.
3. Binary fidelity verification with simulated **PDF** documents (`%PDF-1.7` stream).
4. Binary fidelity verification with simulated **JPG** images (`0xFFD8` SOI ... `0xFFD9` EOI).
5. Rejection of incorrect passwords with clear `Authentication Failed` error.
6. Rejection of tampered ciphertext bytes with GMAC authentication tag failure.
7. Rejection of tampered authentication tag bytes.
8. Rejection of invalid file formats (corrupted magic header).
9. Rejection of truncated or too-small vault files.
10. Determinism prevention (identical file and password produce unique ciphertexts).

---

## 🚀 Running the Project

### Development Server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

### Production Build:
```bash
npm run build
```

### Linter:
```bash
npm run lint
```
*(0 errors, 0 warnings)*
