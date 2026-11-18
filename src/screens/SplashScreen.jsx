import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Key } from 'lucide-react';
import Button from '../components/Button';
import '../styles/screens/splash.css';

export default function SplashScreen() {
  const navigate = useNavigate();

  // Optional auto-redirect after 5s or user can click immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto advance if user is idle
      navigate('/home');
    }, 4500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      {/* Background Cyber Glows */}
      <div className="splash-glow-top" />
      <div className="splash-glow-bottom" />

      {/* Center Branding Content */}
      <div className="splash-content">
        <div className="splash-logo-container">
          <div className="splash-pulse-ring" />
          <div className="splash-pulse-ring delay" />
          <div className="splash-logo-core">
            <svg 
              className="splash-logo-icon" 
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
        </div>

        <h1 className="splash-brand-title">File Guard</h1>
        <p className="splash-subtitle">Secure Your Files</p>
        
        <p className="splash-description">
          Military-grade client-side file encryption system engineered for Android mobile security.
        </p>

        {/* Security badges chips */}
        <div className="splash-security-chips">
          <div className="splash-chip">
            <ShieldCheck size={12} />
            <span>AES-256-GCM</span>
          </div>
          <div className="splash-chip">
            <Key size={12} />
            <span>PBKDF2-SHA256</span>
          </div>
          <div className="splash-chip">
            <Lock size={12} />
            <span>Zero-Knowledge</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA & Info */}
      <div className="splash-footer">
        <Button 
          variant="primary" 
          onClick={() => navigate('/home')}
          icon={ArrowRight}
        >
          Enter Secure Vault
        </Button>
        <p className="splash-project-note">
          File Encryption and Decryption System • v1.0.0
        </p>
      </div>
    </div>
  );
}
