import React, { useState, useRef } from 'react';
import { 
  FileDown, 
  Unlock, 
  Key, 
  Download, 
  RotateCcw, 
  X, 
  AlertTriangle,
  FileCheck,
  Vault
} from 'lucide-react';
import { useFileGuard } from '../context/useFileGuard';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import { formatBytes } from '../utils/formatters';
import { decryptVault } from '../utils/crypto/index.js';
import '../styles/screens/decrypt.css';

export default function DecryptScreen() {
  const { addHistoryRecord, showToast } = useFileGuard();
  const fileInputRef = useRef(null);

  // Form State
  const [vaultFileObject, setVaultFileObject] = useState(null);
  const [selectedVaultFile, setSelectedVaultFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  // Processing & Stages
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [decryptionStatusText, setDecryptionStatusText] = useState('');
  const [decryptionResult, setDecryptionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const isFormValid = selectedVaultFile && password.length >= 1;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVaultFileObject(file);
      setSelectedVaultFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      });
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setVaultFileObject(file);
      setSelectedVaultFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      });
      setErrorMessage(null);
    }
  };

  const handleClearFile = () => {
    setVaultFileObject(null);
    setSelectedVaultFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform Real Cryptographic Decryption
  const handleDecrypt = async () => {
    if (!isFormValid || !vaultFileObject) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setProgress(15);
    setDecryptionStatusText('Reading .fgvault magic header and salt parameters...');

    try {
      const result = await decryptVault(vaultFileObject, password, {
        onProgress: (pct, statusText) => {
          setProgress(pct);
          setDecryptionStatusText(statusText);
        }
      });

      setDecryptionResult(result);

      // Save non-sensitive metadata to persistent history (NO passwords, NO keys, NO unencrypted file contents)
      addHistoryRecord({
        fileName: result.filename,
        vaultName: selectedVaultFile.name,
        operation: 'DECRYPT',
        fileSize: result.size,
        status: 'Verified',
        checksum: result.sha256
      });

      showToast(`File "${result.filename}" decrypted and verified!`, 'success');
    } catch (err) {
      console.error('Decryption failed:', err);
      const userMessage = err.message || 'Decryption failed: Authentication tag verification error.';
      setErrorMessage(userMessage);
      showToast(userMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setVaultFileObject(null);
    setSelectedVaultFile(null);
    setPassword('');
    setDecryptionResult(null);
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export restored original file with its original filename and MIME type
  const handleDownloadRestored = () => {
    if (!decryptionResult || !decryptionResult.restoredBlob) return;
    const url = URL.createObjectURL(decryptionResult.restoredBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = decryptionResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported restored ${decryptionResult.filename}`, 'info');
  };

  return (
    <>
      <TopAppBar title="Decrypt File" showBack={true} />

      <div className="android-screen-scrollable">
        <div className="decrypt-container">
          {/* Header Intro Card */}
          <div className="decrypt-intro-card">
            <Vault className="decrypt-intro-icon" />
            <div className="decrypt-intro-text">
              <h3>Secure Vault Unpacker</h3>
              <p>Provide your password to verify the GMAC tag and restore your file.</p>
            </div>
          </div>

          {!decryptionResult ? (
            <>
              {/* Step 1: Select Vault File (.fgvault) */}
              <div className="form-group" style={{ marginBottom: 4 }}>
                <span className="form-label">
                  <span>1. Select .fgvault File <span style={{ color: 'var(--cyan-primary)' }}>*</span></span>
                </span>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".fgvault,.*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />

                {!selectedVaultFile ? (
                  <div
                    className={`file-drop-zone ${isDragActive ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="drop-zone-icon-box" style={{ background: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                      <FileDown size={26} />
                    </div>
                    <span className="drop-zone-title">Select .fgvault File</span>
                    <span className="drop-zone-subtitle">Tap or drop your encrypted vault file here</span>
                  </div>
                ) : (
                  <div className="vault-detected-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <div className="selected-file-icon" style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' }}>
                        <Vault size={20} />
                      </div>
                      <div>
                        <div className="selected-file-name" title={selectedVaultFile.name}>
                          {selectedVaultFile.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span className="vault-badge-tag">.fgvault</span>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {formatBytes(selectedVaultFile.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isProcessing && (
                      <button 
                        className="clear-file-btn" 
                        onClick={handleClearFile}
                        title="Remove file"
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Decryption Password */}
              <div style={{ marginTop: 8 }}>
                <Input
                  label="2. Master Decryption Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter vault passphrase"
                  icon={Key}
                  required={true}
                  disabled={isProcessing}
                  helperText="Passphrase used when this .fgvault was originally encrypted."
                />
              </div>

              {/* Decryption Error Notice if any */}
              {errorMessage && (
                <div className="tamper-alert">
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Verification Failed:</strong> {errorMessage}
                  </div>
                </div>
              )}

              {/* Decryption Status & Progress Indicator */}
              {isProcessing && (
                <div className="decryption-status-box">
                  <div className="decryption-status-header">
                    <span>Decryption Status:</span>
                    <span className="status-step-pill">AES-256-GCM Active</span>
                  </div>
                  <ProgressBar
                    progress={progress}
                    label={decryptionStatusText}
                  />
                </div>
              )}

              {/* Decrypt Button */}
              <div style={{ marginTop: 4 }}>
                <Button
                  variant="secondary"
                  onClick={handleDecrypt}
                  disabled={!isFormValid || isProcessing}
                  loading={isProcessing}
                  icon={Unlock}
                >
                  {isProcessing ? 'Verifying & Decrypting...' : 'Decrypt File'}
                </Button>
              </div>
            </>
          ) : (
            /* Restored File Preview Result */
            <div className="restored-file-card">
              <div className="restored-icon-badge">
                <FileCheck size={32} />
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                  File Decrypted & Verified!
                </h3>
                <p style={{ fontSize: '12px', color: '#93c5fd', marginTop: 2 }}>
                  AES-256-GCM Authentication Tag passed with zero bit alterations
                </p>
              </div>

              <div className="restored-meta-table">
                <div className="meta-row">
                  <span>Restored Filename:</span>
                  <span style={{ color: '#60a5fa' }}>{decryptionResult.filename}</span>
                </div>
                <div className="meta-row">
                  <span>MIME Type:</span>
                  <span>{decryptionResult.mimeType}</span>
                </div>
                <div className="meta-row">
                  <span>Restored Size:</span>
                  <span>{formatBytes(decryptionResult.size)}</span>
                </div>
                <div className="meta-row">
                  <span>GMAC Status:</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                    100% Bit Integrity Verified
                  </span>
                </div>
                <div className="meta-row">
                  <span>PBKDF2 Iterations:</span>
                  <span>{decryptionResult.iterations.toLocaleString()} rounds</span>
                </div>
                {decryptionResult.sha256 && (
                  <div className="meta-row" style={{ flexDirection: 'column', gap: 2, marginTop: 4 }}>
                    <span>Verified SHA-256 Digest:</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {decryptionResult.sha256}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 6 }}>
                <Button 
                  variant="secondary" 
                  onClick={handleDownloadRestored} 
                  icon={Download}
                >
                  Download Restored File
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  icon={RotateCcw}
                >
                  Decrypt Another Vault
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
