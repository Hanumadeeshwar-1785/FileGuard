import React, { useState, useEffect } from 'react';
import { INITIAL_FILE_HISTORY } from '../utils/mockData';
import { FileGuardContext } from './FileGuardContextInstance';

const STORAGE_KEY_HISTORY = 'fileguard_history_v1';
const STORAGE_KEY_FRAME = 'fileguard_device_frame';

export function FileGuardProvider({ children }) {
  // History state loaded from localStorage or default mock records
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_FILE_HISTORY;
    } catch {
      return INITIAL_FILE_HISTORY;
    }
  });

  // Mobile frame simulator toggle for desktop testing (default true for desktop)
  const [showDeviceFrame, setShowDeviceFrame] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FRAME);
      if (saved !== null) return JSON.parse(saved);
      // Auto-enable frame on wide screens
      return typeof window !== 'undefined' && window.innerWidth > 640;
    } catch {
      return true;
    }
  });

  // Global notification toast/banner
  const [toast, setToast] = useState(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  // Sync frame toggle
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FRAME, JSON.stringify(showDeviceFrame));
    } catch (e) {
      console.warn('Could not save frame setting', e);
    }
  }, [showDeviceFrame]);

  // Clear toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const addHistoryRecord = (record) => {
    // Defense-in-depth: Ensure NO password, key, or unencrypted file buffer can ever enter history
    const { 
      password: _pwd, 
      key: _k, 
      fileData: _fd, 
      fileBuffer: _fb, 
      vaultBlob: _vb, 
      restoredBlob: _rb, 
      ...safeRecord 
    } = record;

    const newRecord = {
      id: `fg-rec-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      status: safeRecord.operation === 'ENCRYPT' ? 'Secured' : 'Verified',
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-HMAC-SHA256 (310k rounds)',
      ...safeRecord
    };
    setHistory((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('File activity history cleared', 'info');
  };

  const resetToSampleHistory = () => {
    setHistory(INITIAL_FILE_HISTORY);
    showToast('Sample history restored', 'success');
  };

  const toggleDeviceFrame = () => {
    setShowDeviceFrame((prev) => !prev);
  };

  return (
    <FileGuardContext.Provider
      value={{
        history,
        addHistoryRecord,
        clearHistory,
        resetToSampleHistory,
        showDeviceFrame,
        toggleDeviceFrame,
        toast,
        showToast
      }}
    >
      {children}
    </FileGuardContext.Provider>
  );
}

export default FileGuardProvider;
