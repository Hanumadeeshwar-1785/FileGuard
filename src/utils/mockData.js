/**
 * Default mock data for File Guard activity history and security references
 */

export const INITIAL_FILE_HISTORY = [
  {
    id: 'fg-rec-001',
    fileName: 'Financial_Ledger_Q3.xlsx',
    vaultName: 'Financial_Ledger_Q3.xlsx.fgvault',
    operation: 'ENCRYPT',
    fileSize: 2457600, // 2.34 MB
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
    status: 'Secured',
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'fg-rec-002',
    fileName: 'Identity_Passport_Scan.pdf',
    vaultName: 'Identity_Passport_Scan.pdf.fgvault',
    operation: 'DECRYPT',
    fileSize: 4892400, // 4.66 MB
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
    status: 'Verified',
    checksum: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'fg-rec-003',
    fileName: 'Database_Credentials_Prod.env',
    vaultName: 'Database_Credentials_Prod.env.fgvault',
    operation: 'ENCRYPT',
    fileSize: 8420, // 8.2 KB
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(), // 1d ago
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
    status: 'Secured',
    checksum: 'c24594c9d92476b71f92c10b77b7ee3a4f6cf7e7f6e4a0ec49d44c9b2f6f2648'
  },
  {
    id: 'fg-rec-004',
    fileName: 'Clinical_Trial_Biometrics.csv',
    vaultName: 'Clinical_Trial_Biometrics.csv.fgvault',
    operation: 'ENCRYPT',
    fileSize: 18450200, // 17.6 MB
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 2d ago
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
    status: 'Secured',
    checksum: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    id: 'fg-rec-005',
    fileName: 'Contract_Agreements_Signed.docx',
    vaultName: 'Contract_Agreements_Signed.docx.fgvault',
    operation: 'DECRYPT',
    fileSize: 1240800, // 1.18 MB
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString(), // 3d ago
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
    status: 'Verified',
    checksum: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  }
];

export const SECURITY_TOPICS = [
  {
    id: 'aes-256-gcm',
    title: 'AES-256-GCM',
    subtitle: 'Galois/Counter Mode Authenticated Encryption',
    category: 'Symmetric Cipher',
    badge: 'Industry Standard (NIST FIPS 197)',
    icon: 'ShieldCheck',
    keyPoints: [
      {
        heading: 'Authenticated Encryption with Associated Data (AEAD)',
        description: 'Combines the confidentiality of AES-256 counter mode with the integrity protection of the Galois Authentication Tag (GMAC). Any single-bit tampering or corruption immediately causes decryption to fail before any payload is released.'
      },
      {
        heading: '256-Bit Cryptographic Key Space',
        description: 'Provides 2^256 possible key combinations (approx. 1.15 x 10^77). Resilient against brute-force attacks even with exascale supercomputers and quantum Grover search acceleration.'
      },
      {
        heading: 'Unique 96-Bit Initialization Vector (IV / Nonce)',
        description: 'Every encryption operation creates a cryptographically secure, randomized 96-bit IV via crypto.getRandomValues(). A nonce is never reused with the same key, preventing ciphertext pattern leakage.'
      },
      {
        heading: 'Hardware-Accelerated Performance',
        description: 'Utilizes AES-NI CPU instructions and Web Cryptography hardware pipelines on modern Android Snapdragon, Dimensity, and Tensor chipsets for blazingly fast encryption with negligible battery impact.'
      }
    ],
    technicalSpec: {
      'Block Size': '128 bits (16 bytes)',
      'Key Length': '256 bits (32 bytes)',
      'Nonce/IV Size': '96 bits (12 bytes) recommended',
      'Auth Tag Size': '128 bits (16 bytes)',
      'Security Level': 'Post-Quantum symmetric hardness'
    }
  },
  {
    id: 'pbkdf2-sha256',
    title: 'PBKDF2 & SHA-256',
    subtitle: 'Password-Based Key Derivation Function 2',
    category: 'Key Derivation',
    badge: 'RFC 2898 / NIST SP 800-132',
    icon: 'KeyRound',
    keyPoints: [
      {
        heading: 'Bridging Human Passwords to Cryptographic Keys',
        description: 'Human memorable passwords have low Shannon entropy. PBKDF2 transforms arbitrary-length user passphrases into a cryptographically strong 256-bit AES master key.'
      },
      {
        heading: 'Cryptographic Salt (16+ Random Bytes)',
        description: 'A fresh, unpredictable salt is generated for every file. This completely neutralizes precomputed rainbow table attacks and prevents identical passwords from producing identical derived keys.'
      },
      {
        heading: 'High Iteration Count (310,000 Rounds)',
        description: 'Applies HMAC-SHA-256 in 310,000 chained iterations. While taking under 200ms on modern hardware, it multiplies the computational cost for GPU-based dictionary attacks by orders of magnitude.'
      },
      {
        heading: 'HMAC-SHA-256 Pseudorandom Function (PRF)',
        description: 'Employs SHA-256 cryptographic hashing within HMAC mode to guarantee uniform key distribution and zero correlation to original passphrase characters.'
      }
    ],
    technicalSpec: {
      'Digest Algorithm': 'HMAC-SHA-256',
      'Default Iterations': '310,000 rounds (OWASP standard)',
      'Salt Length': '128 bits (16 bytes) CSPRNG',
      'Derived Key Output': '256 bits (32 bytes)',
      'Resistance': 'Rainbow tables, GPU brute-force'
    }
  },
  {
    id: 'pbe-architecture',
    title: 'Password-Based Encryption (PBE)',
    subtitle: 'Zero-Knowledge Client-Side Vault Format',
    category: 'Vault Architecture',
    badge: 'Zero-Knowledge Storage',
    icon: 'Vault',
    keyPoints: [
      {
        heading: 'Zero-Knowledge Privacy',
        description: 'Your passphrase and decrypted plaintext never leave your mobile device. Keys exist strictly in volatile RAM during execution and are discarded immediately upon completion.'
      },
      {
        heading: '.fgvault Container Specification',
        description: 'File Guard packages the ciphertext into a self-contained .fgvault binary envelope containing: Magic Header ("FGV1"), Salt (16B), Nonce IV (12B), Original Filename & MIME metadata, Ciphertext, and 16-byte Auth Tag.'
      },
      {
        heading: 'Tamper-Proof File Integrity',
        description: 'If an adversary alters even one byte of the .fgvault file during storage or transfer, the GCM tag verification aborts, alerting you to potential data tampering or bit-rot.'
      },
      {
        heading: 'Offline-First Independence',
        description: 'Requires zero cloud servers, zero account sign-ups, and zero network calls. Operates natively on Android mobile hardware with full user sovereignty.'
      }
    ],
    technicalSpec: {
      'Container Extension': '.fgvault',
      'Storage Model': '100% Client-Side Local / Android File System',
      'Telemetry': 'Zero tracking, zero analytics',
      'Key Retention': 'Zero-persistence in storage/cookies/localStorage',
      'Format Structure': 'Header (4B) | Salt (16B) | IV (12B) | Meta | Payload | Tag (16B)'
    }
  }
];

export const APP_METADATA = {
  appName: 'File Guard',
  version: '1.0.0-android',
  build: '2026.11-rc1',
  projectTitle: 'File Encryption and Decryption System – Secure File Storage Application',
  tagline: 'Secure Your Files',
  description: 'An Android-first, cybersecurity-focused file encryption and decryption application implementing AES-256-GCM and PBKDF2 authenticated cryptographic containers.',
  techStack: [
    { name: 'React 19', role: 'Component UI & State Architecture' },
    { name: 'Vite 8', role: 'Modern Build Tool & HMR' },
    { name: 'JavaScript (ES2024)', role: 'Core Logic & Asynchronous Processing' },
    { name: 'CSS3 & CSS Custom Properties', role: 'Cybersecurity Theming, Glows & Animations' },
    { name: 'Lucide Icons', role: 'Cyber & Security Iconography' },
    { name: 'React Router v7', role: 'Screen Navigation & Mobile Transitions' },
    { name: 'W3C Web Cryptography API', role: 'Hardware-Accelerated SubtleCrypto Engine' }
  ],
  systemSpecs: [
    { label: 'Cipher Algorithm', value: 'AES-256-GCM' },
    { label: 'Key Derivation', value: 'PBKDF2-HMAC-SHA256 (310,000 iterations)' },
    { label: 'Vault Extension', value: '.fgvault' },
    { label: 'UI Mode', value: 'Android-First Cyber Interface' },
    { label: 'Engine Status', value: 'Active Real Crypto Engine' }
  ]
};

