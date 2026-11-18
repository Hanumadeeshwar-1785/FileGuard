import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Smartphone, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Info 
} from 'lucide-react';
import { useFileGuard } from '../context/useFileGuard';

export default function AndroidFrame({ children }) {
  const { showDeviceFrame, toggleDeviceFrame, toast } = useFileGuard();
  const [currentTime, setCurrentTime] = useState('9:41');

  // Keep time updated
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-wrapper">
      {/* Desktop Helper Bar to toggle Device Frame vs Fullscreen Mobile */}
      <div className="desktop-controls-bar">
        <div className="desktop-badge">
          <span className="desktop-badge-dot"></span>
          <span>ANDROID VIEWPORT</span>
        </div>
        <button 
          className="frame-toggle-btn"
          onClick={toggleDeviceFrame}
          title={showDeviceFrame ? "Switch to Fullscreen Mobile View" : "Switch to Android Frame Preview"}
        >
          {showDeviceFrame ? (
            <>
              <Maximize2 size={13} />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Smartphone size={13} />
              <span>Device Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Android Device Mockup Container */}
      <div className={`android-device ${!showDeviceFrame ? 'frameless' : ''}`}>
        {/* Camera Punch Hole */}
        {showDeviceFrame && <div className="android-punch-hole" />}

        {/* Android Status Bar */}
        <div className="android-status-bar">
          <span className="status-bar-time">{currentTime}</span>
          <div className="status-bar-icons">
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>5G</span>
            <Wifi size={13} />
            <BatteryMedium size={14} />
          </div>
        </div>

        {/* Toast notifications inside mobile viewport */}
        {toast && (
          <div className="phone-toast-container">
            <div className={`phone-toast ${toast.type}`}>
              {toast.type === 'success' && <CheckCircle2 size={16} color="var(--color-success)" />}
              {toast.type === 'error' && <AlertCircle size={16} color="var(--color-danger)" />}
              {toast.type === 'info' && <Info size={16} color="var(--cyan-primary)" />}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Screen Viewport with child views and navigation */}
        <div className="android-screen-viewport">
          {children}
        </div>

        {/* Android Bottom Gesture Pill */}
        {showDeviceFrame && <div className="android-gesture-pill" />}
      </div>
    </div>
  );
}
