import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Lock, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  FileLock, 
  Download, 
  RotateCcw, 
  X, 
  FileCode,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { useFileGuard } from '../context/useFileGuard';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import { formatBytes } from '../utils/formatters';
import { encryptFile } from '../utils/crypto/index.js';
import '../styles/screens/encrypt.css';

export default function EncryptScreen() {
  const { addHistoryRecord, showToast } = useFileGuard();
  const fileInputRef = useRef(null);

  // Form State
  const [fileObject, setFileObject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [includeIntegrityCheck, setIncludeIntegrityCheck] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Processing & Stages
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Securing File...');
  const [encryptionResult, setEncryptionResult] = useState(null);

  const stages = [
    'Generating 128-bit CSPRNG Salt & 96-bit Nonce IV',
    'Deriving 256-bit Key via PBKDF2 (310,000 iterations)',
    'Executing AES-256-GCM Authenticated Encryption',
    'Packaging Ciphertext & 16-Byte Auth Tag (.fgvault)'
  ];

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 
    ? password === confirmPassword 
    : undefined;

  const isFormValid = selectedFile && password.length >= 6 && passwordsMatch;

  // File selection handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObject(file);
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified
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
      setFileObject(file);
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified
      });
      setErrorMessage(null);
    }
  };

  const handleClearFile = () => {
    setFileObject(null);
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Perform Real Cryptographic Encryption
  const handleEncrypt = async () => {
    if (!isFormValid || !fileObject) return;

    setIsProcessing(true);
    setProgress(10);
    setCurrentStage(0);
    setStatusMessage('Preparing cryptographic environment...');
    setErrorMessage(null);
    setEncryptionResult(null);

    try {
      const result = await encryptFile(fileObject, password, {
        onProgress: (pct, statusText) => {
          setProgress(pct);
          setStatusMessage(statusText);
          if (pct < 30) setCurrentStage(0);
          else if (pct < 60) setCurrentStage(1);
          else if (pct < 85) setCurrentStage(2);
          else setCurrentStage(3);
        }
      });

      setEncryptionResult(result);

      // Save non-sensitive metadata to persistent history (NO passwords, NO keys, NO unencrypted file contents)
      addHistoryRecord({
        fileName: result.originalName,
        vaultName: result.vaultName,
        operation: 'ENCRYPT',
        fileSize: result.originalSize,
        status: 'Secured',
        checksum: result.originalSha256
      });

      showToast(`File "${result.originalName}" secured into .fgvault!`, 'success');
    } catch (err) {
      console.error('Encryption error:', err);
      setErrorMessage(err.message || 'Encryption failed due to an unexpected error.');
      showToast(err.message || 'Encryption failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFileObject(null);
    setSelectedFile(null);
    setPassword('');
    setConfirmPassword('');
    setEncryptionResult(null);
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Export encrypted .fgvault file
  const handleDownloadVault = () => {
    if (!encryptionResult || !encryptionResult.vaultBlob) return;
    const url = URL.createObjectURL(encryptionResult.vaultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = encryptionResult.vaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${encryptionResult.vaultName}`, 'info');
  };

  return (
    <>
      <TopAppBar title="Encrypt File" showBack={true} />

      <div className="android-screen-scrollable">
        <div className="encrypt-container">
          {/* Intro Notice */}
          <div className="screen-intro-card">
            <ShieldCheck className="intro-icon" />
            <div className="intro-text-box">
              <h3>AES-256-GCM Vault Packer</h3>
              <p>Encrypts your file with 310,000 PBKDF2 rounds into a tamper-resistant .fgvault container.</p>
            </div>
          </div>

          {errorMessage && (
            <div className="tamper-alert" style={{ marginBottom: 4 }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Encryption Error:</strong> {errorMessage}
              </div>
            </div>
          )}

          {!encryptionResult ? (
            <>
              {/* Step 1: Select File Section */}
              <div className="form-group" style={{ marginBottom: 4 }}>
                <span className="form-label">
                  <span>1. Select Target File <span style={{ color: 'var(--cyan-primary)' }}>*</span></span>
                </span>

                {/* Hidden Native File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={isProcessing}
                />

                {!selectedFile ? (
                  <div
                    className={`file-drop-zone ${isDragActive ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="drop-zone-icon-box">
                      <FileUp size={26} />
                    </div>
                    <span className="drop-zone-title">Tap to Choose File</span>
                    <span className="drop-zone-subtitle">or drag and drop here (PDF, JPG, PNG, DOCX, ZIP)</span>
                  </div>
                ) : (
                  <div className="selected-file-card">
                    <div className="selected-file-info">
                      <div className="selected-file-icon">
                        <FileCode size={20} />
                      </div>
                      <div>
                        <div className="selected-file-name" title={selectedFile.name}>
                          {selectedFile.name}
                        </div>
                        <div className="selected-file-meta">
                          {formatBytes(selectedFile.size)} • {selectedFile.type?.split('/')[1]?.toUpperCase() || 'FILE'}
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

              {/* Step 2: Password & Confirmation */}
              <div style={{ marginTop: 8 }}>
                <Input
                  label="2. Master Encryption Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter strong passphrase"
                  icon={Key}
                  showStrength={true}
                  required={true}
                  disabled={isProcessing}
                  helperText="Minimum 6 characters. Passwords are never saved in storage or sent to any server."
                />

                <Input
                  label="3. Confirm Master Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Re-enter master passphrase"
                  icon={Lock}
                  matchValid={passwordsMatch}
                  required={true}
                  disabled={isProcessing}
                />
              </div>

              {/* Security Preferences */}
              <div className="security-options-box">
                <label className="option-row">
                  <div className="option-label-group">
                    <Sliders size={16} color="var(--cyan-primary)" />
                    <span>Include SHA-256 Integrity Verification</span>
                  </div>
                  <input
                    type="checkbox"
                    className="checkbox-toggle"
                    checked={includeIntegrityCheck}
                    onChange={(e) => setIncludeIntegrityCheck(e.target.checked)}
                    disabled={isProcessing}
                  />
                </label>
                <span className="option-subtext">
                  Generates an independent SHA-256 hash digest of the original file for tamper auditing.
                </span>
              </div>

              {/* Progress Indicator Card when encrypting */}
              {isProcessing && (
                <div className="progress-card">
                  <ProgressBar
                    progress={progress}
                    label={statusMessage}
                  />

                  <div className="progress-stage-list">
                    {stages.map((stageName, idx) => {
                      const isDone = idx < currentStage;
                      const isCurrent = idx === currentStage;
                      return (
                        <div key={idx} className="progress-stage-item">
                          <div className={`stage-item-left ${isCurrent ? 'active' : isDone ? 'completed' : ''}`}>
                            {isDone ? (
                              <CheckCircle2 size={14} color="var(--color-success)" />
                            ) : isCurrent ? (
                              <div className="stage-indicator-spinner" />
                            ) : (
                              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border-default)', display: 'inline-block' }} />
                            )}
                            <span>{stageName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Encrypt File Action Button */}
              <div style={{ marginTop: 4 }}>
                <Button
                  variant="primary"
                  onClick={handleEncrypt}
                  disabled={!isFormValid || isProcessing}
                  loading={isProcessing}
                  icon={FileLock}
                >
                  {isProcessing ? 'Securing File...' : 'Encrypt File'}
                </Button>
              </div>
            </>
          ) : (
            /* Success Vault Result View */
            <div className="success-vault-card">
              <div className="success-icon-badge">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="success-vault-title">File Secured Successfully!</h3>
                <p className="success-vault-subtitle">
                  Encrypted into zero-knowledge .fgvault container
                </p>
              </div>

              <div className="vault-file-meta-box">
                <div className="meta-row">
                  <span>Encrypted Vault:</span>
                  <span style={{ color: 'var(--cyan-primary)' }}>{encryptionResult.vaultName}</span>
                </div>
                <div className="meta-row">
                  <span>Source File:</span>
                  <span>{encryptionResult.originalName}</span>
                </div>
                <div className="meta-row">
                  <span>Original Size:</span>
                  <span>{formatBytes(encryptionResult.originalSize)}</span>
                </div>
                <div className="meta-row">
                  <span>Encrypted Vault Size:</span>
                  <span>{formatBytes(encryptionResult.vaultSize)}</span>
                </div>
                <div className="meta-row">
                  <span>Cipher Algorithm:</span>
                  <span>{encryptionResult.algorithm}</span>
                </div>
                <div className="meta-row">
                  <span>Key Derivation:</span>
                  <span>{encryptionResult.kdf}</span>
                </div>
                {encryptionResult.originalSha256 && (
                  <div className="meta-row" style={{ flexDirection: 'column', gap: 2, marginTop: 4 }}>
                    <span>SHA-256 Digest (Original):</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {encryptionResult.originalSha256}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 6 }}>
                <Button 
                  variant="primary" 
                  onClick={handleDownloadVault} 
                  icon={Download}
                >
                  Download .fgvault File
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  icon={RotateCcw}
                >
                  Encrypt Another File
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
