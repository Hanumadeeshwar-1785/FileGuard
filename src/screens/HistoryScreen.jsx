import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  FileLock, 
  Lock, 
  Unlock, 
  Calendar, 
  HardDrive, 
  ChevronRight
} from 'lucide-react';
import { useFileGuard } from '../context/useFileGuard';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { formatBytes, formatFullDateTime, formatDate } from '../utils/formatters';
import '../styles/screens/history.css';

export default function HistoryScreen() {
  const { history, clearHistory, resetToSampleHistory } = useFileGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ENCRYPT' | 'DECRYPT'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Filtered files
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vaultName && item.vaultName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && item.operation === filterType;
  });

  const countEncrypt = history.filter(h => h.operation === 'ENCRYPT').length;
  const countDecrypt = history.filter(h => h.operation === 'DECRYPT').length;

  return (
    <>
      <TopAppBar 
        title="File History" 
        showBack={true}
        customRight={
          <button 
            className="top-bar-action-icon"
            onClick={() => setShowConfirmClear(true)}
            title="Clear History"
            aria-label="Clear History"
          >
            <Trash2 size={18} />
          </button>
        }
      />

      <div className="android-screen-scrollable">
        <div className="history-container">
          {/* Controls: Search & Tabs */}
          <div className="history-controls">
            <div className="history-search-input">
              <Search size={16} className="history-search-icon" />
              <input
                type="text"
                placeholder="Search history by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-field"
              />
            </div>

            <div className="history-filter-tabs">
              <button
                className={`filter-tab ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                <span>All</span>
                <span className="tab-badge">{history.length}</span>
              </button>
              <button
                className={`filter-tab ${filterType === 'ENCRYPT' ? 'active' : ''}`}
                onClick={() => setFilterType('ENCRYPT')}
              >
                <Lock size={12} />
                <span>Encrypted</span>
                <span className="tab-badge">{countEncrypt}</span>
              </button>
              <button
                className={`filter-tab ${filterType === 'DECRYPT' ? 'active' : ''}`}
                onClick={() => setFilterType('DECRYPT')}
              >
                <Unlock size={12} />
                <span>Decrypted</span>
                <span className="tab-badge">{countDecrypt}</span>
              </button>
            </div>
          </div>

          {/* Activity List */}
          {filteredHistory.length > 0 ? (
            <div className="history-list">
              {filteredHistory.map((item) => {
                const isEncrypt = item.operation === 'ENCRYPT';
                return (
                  <div
                    key={item.id}
                    className="history-card"
                    onClick={() => setSelectedRecord(item)}
                  >
                    <div className="history-card-header">
                      <div className="history-card-title-group">
                        <span className={`history-type-badge ${isEncrypt ? 'encrypt' : 'decrypt'}`}>
                          {isEncrypt ? <Lock size={10} /> : <Unlock size={10} />}
                          <span>{isEncrypt ? 'ENCRYPT' : 'DECRYPT'}</span>
                        </span>
                        <span className="history-file-name" title={item.fileName}>
                          {item.fileName}
                        </span>
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>

                    <div className="history-meta-row">
                      <div className="history-date-time">
                        <Calendar size={12} />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="history-size-algo">
                        <HardDrive size={12} />
                        <span>{formatBytes(item.fileSize)}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--cyan-primary)' }}>{item.algorithm}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-history-card">
              <FileLock size={36} color="var(--text-muted)" />
              <h4 style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 700 }}>
                {history.length === 0 ? 'No History Records' : 'No Matching Files Found'}
              </h4>
              <p style={{ fontSize: '12px', maxWidth: '240px', lineHeight: 1.4 }}>
                {history.length === 0 
                  ? 'All cryptographic operations performed in this session will appear here.'
                  : `No operations match query "${searchQuery}" in this category.`}
              </p>
              {history.length === 0 && (
                <div style={{ marginTop: 8 }}>
                  <Button 
                    variant="outline" 
                    onClick={resetToSampleHistory}
                    icon={RotateCcw}
                    style={{ width: 'auto', padding: '8px 14px', fontSize: '12px' }}
                  >
                    Load Sample Activity Data
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected History Record Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Operation Audit Details"
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
                <span>File Payload Size:</span>
                <span>{formatBytes(selectedRecord.fileSize)}</span>
              </div>
              <div className="meta-row">
                <span>Operation Timestamp:</span>
                <span>{formatFullDateTime(selectedRecord.timestamp)}</span>
              </div>
              <div className="meta-row">
                <span>Cryptographic Algorithm:</span>
                <span>{selectedRecord.algorithm}</span>
              </div>
              <div className="meta-row">
                <span>Key Derivation Function:</span>
                <span>{selectedRecord.kdf}</span>
              </div>
              {selectedRecord.checksum && (
                <div className="meta-row" style={{ flexDirection: 'column', gap: 2, marginTop: 4 }}>
                  <span>Integrity SHA-256 Checksum:</span>
                  <span style={{ wordBreak: 'break-all', color: 'var(--text-secondary)', fontSize: '10px' }}>
                    {selectedRecord.checksum}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal
        isOpen={showConfirmClear}
        onClose={() => setShowConfirmClear(false)}
        title="Clear Activity Log"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Are you sure you want to clear your local file activity history? This action clears session logs stored in your browser's volatile storage.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <Button
              variant="outline"
              onClick={() => setShowConfirmClear(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearHistory();
                setShowConfirmClear(false);
              }}
              icon={Trash2}
            >
              Clear Log
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </>
  );
}
