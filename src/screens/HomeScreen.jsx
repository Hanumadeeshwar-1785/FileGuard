import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ChevronRight, 
  Cpu, 
  HardDrive, 
  Layers, 
  Activity, 
  FileCheck, 
  FileLock,
  ArrowUpRight
} from 'lucide-react';
import { useFileGuard } from '../context/useFileGuard';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { formatBytes, formatDate, formatFullDateTime } from '../utils/formatters';
import '../styles/screens/home.css';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { history } = useFileGuard();
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Take top 4 recent files
  const recentFiles = history.slice(0, 4);

  return (
    <>
      <TopAppBar title="File Guard" />

      <div className="android-screen-scrollable">
        <div className="home-container">
          {/* Welcome & System Status Bar */}
          <div className="home-welcome-header">
            <div>
              <div className="home-welcome-greeting">
                <span className="pulse-beacon" />
                <span>Vault Active</span>
              </div>
              <h2 className="home-welcome-title">Secure Storage</h2>
            </div>
            <div className="home-system-status-indicator">
              <ShieldCheck size={14} />
              <span>Protected</span>
            </div>
          </div>

          {/* Quick Action Cards: Encrypt File & Decrypt File */}
          <div className="home-actions-section">
            <div 
              className="action-card-btn encrypt" 
              onClick={() => navigate('/encrypt')}
              role="button"
              tabIndex={0}
            >
              <div className="action-card-left">
                <div className="action-card-icon-box">
                  <Lock size={22} />
                </div>
                <div className="action-card-texts">
                  <span className="action-card-title">Encrypt File</span>
                  <span className="action-card-subtitle">Lock any file with AES-256-GCM (.fgvault)</span>
                </div>
              </div>
              <ChevronRight size={18} className="action-card-arrow" />
            </div>

            <div 
              className="action-card-btn decrypt" 
              onClick={() => navigate('/decrypt')}
              role="button"
              tabIndex={0}
            >
              <div className="action-card-left">
                <div className="action-card-icon-box">
                  <Unlock size={22} />
                </div>
                <div className="action-card-texts">
                  <span className="action-card-title">Decrypt File</span>
                  <span className="action-card-subtitle">Restore plaintext from protected vault</span>
                </div>
              </div>
              <ChevronRight size={18} className="action-card-arrow" />
            </div>
          </div>

          {/* Security Status Section */}
          <div className="security-status-card">
            <div className="security-status-header">
              <div className="security-status-title-group">
                <ShieldCheck className="security-status-title-icon" />
                <span className="security-status-title">Security Status</span>
              </div>
              <Link 
                to="/security" 
                style={{ 
                  color: 'var(--cyan-primary)', 
                  fontSize: '11px', 
                  fontFamily: 'var(--font-mono)', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                Inspect Specs <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="security-metrics-grid">
              <div className="security-metric-tile">
                <span className="metric-label">Cipher Engine</span>
                <span className="metric-value cyan">
                  <Cpu size={14} /> AES-256-GCM
                </span>
              </div>
              <div className="security-metric-tile">
                <span className="metric-label">Key Derivation</span>
                <span className="metric-value">
                  <Layers size={14} /> PBKDF2-SHA256
                </span>
              </div>
              <div className="security-metric-tile">
                <span className="metric-label">Memory Privacy</span>
                <span className="metric-value green">
                  <HardDrive size={14} /> Client-Side Only
                </span>
              </div>
              <div className="security-metric-tile">
                <span className="metric-label">Tamper Defense</span>
                <span className="metric-value cyan">
                  <Activity size={14} /> GMAC Auth Tag
                </span>
              </div>
            </div>
          </div>

          {/* Active Cryptographic Engine Banner */}
          <div className="prototype-notice-card" style={{ borderColor: 'rgba(0, 240, 255, 0.35)', background: 'rgba(0, 240, 255, 0.06)', color: '#bae6fd' }}>
            <ShieldCheck size={16} color="var(--cyan-primary)" />
            <div>
              <strong>Cryptographic Engine Active:</strong> Real client-side AES-256-GCM encryption with 310,000 PBKDF2 iterations via W3C Web Crypto API.
            </div>
          </div>

          {/* Recently Processed Files Section */}
          <div className="recent-files-section">
            <div className="recent-files-header">
              <h3 className="section-title">
                <Activity size={16} color="var(--cyan-primary)" />
                <span>Recently Processed Files</span>
              </h3>
              <Link to="/history" className="section-view-all-link">
                View All ({history.length})
                <ChevronRight size={14} />
              </Link>
            </div>

            {recentFiles.length > 0 ? (
              <div className="recent-files-list">
                {recentFiles.map((file) => {
                  const isEncrypt = file.operation === 'ENCRYPT';
                  return (
                    <div 
                      key={file.id} 
                      className="recent-file-item"
                      onClick={() => setSelectedRecord(file)}
                    >
                      <div className="recent-file-left">
                        <div className={`recent-file-icon-box ${isEncrypt ? 'encrypt' : 'decrypt'}`}>
                          {isEncrypt ? <FileLock size={18} /> : <FileCheck size={18} />}
                        </div>
                        <div className="recent-file-details">
                          <span className="recent-file-name" title={file.fileName}>
                            {file.fileName}
                          </span>
                          <div className="recent-file-meta">
                            <span>{formatBytes(file.fileSize)}</span>
                            <span>•</span>
                            <span>{file.algorithm}</span>
                          </div>
                        </div>
                      </div>

                      <div className="recent-file-right">
                        <StatusBadge status={file.status} type={file.operation} />
                        <span className="recent-file-time">{formatDate(file.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-recent-card">
                <FileLock size={32} color="var(--text-muted)" />
                <p style={{ fontSize: '13px' }}>No recent file operations</p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Encrypt or decrypt a file to begin your vault activity log
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected File Details Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="File Activity Details"
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedRecord.fileName}
              </span>
              <StatusBadge status={selectedRecord.status} type={selectedRecord.operation} />
            </div>

            <div className="vault-file-meta-box">
              <div className="meta-row">
                <span>Operation:</span>
                <span style={{ color: selectedRecord.operation === 'ENCRYPT' ? 'var(--cyan-primary)' : '#60a5fa' }}>
                  {selectedRecord.operation === 'ENCRYPT' ? 'File Encryption' : 'File Decryption'}
                </span>
              </div>
              <div className="meta-row">
                <span>Vault Filename:</span>
                <span>{selectedRecord.vaultName || `${selectedRecord.fileName}.fgvault`}</span>
              </div>
              <div className="meta-row">
                <span>File Size:</span>
                <span>{formatBytes(selectedRecord.fileSize)}</span>
              </div>
              <div className="meta-row">
                <span>Processed At:</span>
                <span>{formatFullDateTime(selectedRecord.timestamp)}</span>
              </div>
              <div className="meta-row">
                <span>Cryptographic Cipher:</span>
                <span>{selectedRecord.algorithm}</span>
              </div>
              <div className="meta-row">
                <span>Key Derivation:</span>
                <span>{selectedRecord.kdf}</span>
              </div>
              {selectedRecord.checksum && (
                <div className="meta-row" style={{ flexDirection: 'column', gap: 2, marginTop: 4 }}>
                  <span>SHA-256 Checksum:</span>
                  <span style={{ wordBreak: 'break-all', color: 'var(--text-secondary)', fontSize: '10px' }}>
                    {selectedRecord.checksum}
                  </span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Protected with authenticated Galois/Counter Mode. Any alteration to the ciphertext container will immediately invalidate decryption.
            </p>
          </div>
        )}
      </Modal>

      <BottomNav />
    </>
  );
}
