import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Info } from 'lucide-react';

export default function TopAppBar({ title = 'File Guard', showBack = false, customRight = null }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const isHome = location.pathname === '/home';

  return (
    <header className="top-app-bar">
      <div className="top-bar-left">
        {showBack && !isHome ? (
          <button 
            className="top-bar-back-btn" 
            onClick={handleBack}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="top-bar-brand" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <svg 
              className="top-bar-logo-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="9" y="11" width="6" height="4" rx="1" fill="#00f0ff" stroke="#00f0ff" />
              <path d="M10 11V9a2 2 0 0 1 4 0v2" stroke="#00f0ff" />
            </svg>
          </div>
        )}
        <h1 className="top-bar-title">{title}</h1>
      </div>

      <div className="top-bar-right">
        {customRight ? (
          customRight
        ) : (
          <>
            <div className="top-bar-security-pill" title="Security Status: AES-256-GCM Engine Ready">
              <ShieldCheck size={13} />
              <span>AES-256</span>
            </div>
            <button 
              className="top-bar-action-icon" 
              onClick={() => navigate('/security')}
              title="Security Information"
              aria-label="Security Specs"
            >
              <Info size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

