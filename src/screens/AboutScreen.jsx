import React from 'react';
import { 
  ShieldCheck, 
  Code2, 
  Cpu, 
  Smartphone, 
  Lock, 
  ServerOff, 
  Award
} from 'lucide-react';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import { APP_METADATA } from '../utils/mockData';
import '../styles/screens/about.css';

export default function AboutScreen() {
  return (
    <>
      <TopAppBar title="About Application" showBack={true} />

      <div className="android-screen-scrollable">
        <div className="about-screen-container">
          {/* Hero App Identity Card */}
          <div className="about-hero-card">
            <div className="about-logo-wrapper">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ width: 42, height: 42 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <rect x="9" y="11" width="6" height="4" rx="1" fill="#00f0ff" stroke="#00f0ff" />
                <path d="M10 11V9a2 2 0 0 1 4 0v2" stroke="#00f0ff" />
              </svg>
            </div>

            <h2 className="about-app-name">{APP_METADATA.appName}</h2>
            <span className="about-app-version">v{APP_METADATA.version} ({APP_METADATA.build})</span>

            <div className="about-project-title-box">
              <div className="about-project-label">Project Title</div>
              <div className="about-project-title">
                {APP_METADATA.projectTitle}
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {APP_METADATA.description}
            </p>
          </div>

          {/* Technology Information */}
          <div className="tech-stack-card">
            <h3 className="card-heading">
              <Code2 size={18} />
              <span>Technology Stack</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {APP_METADATA.techStack.map((tech, idx) => (
                <div key={idx} className="tech-item-row">
                  <div>
                    <div className="tech-item-name">{tech.name}</div>
                    <div className="tech-item-role">{tech.role}</div>
                  </div>
                  <span className="status-badge muted" style={{ fontSize: '10px' }}>
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System & Cryptographic Specifications */}
          <div className="tech-stack-card">
            <h3 className="card-heading">
              <Cpu size={18} />
              <span>Cryptographic Architecture Specs</span>
            </h3>

            <div className="tech-spec-table">
              {APP_METADATA.systemSpecs.map((item, idx) => (
                <div key={idx} className="tech-spec-row">
                  <span className="tech-spec-label">{item.label}</span>
                  <span className="tech-spec-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Security Pillars */}
          <div className="tech-stack-card">
            <h3 className="card-heading">
              <ShieldCheck size={18} />
              <span>Security Guarantees</span>
            </h3>

            <div className="security-pillars-grid">
              <div className="pillar-box">
                <ServerOff />
                <span className="pillar-title">100% Offline</span>
                <span className="pillar-desc">Runs strictly on-device without remote servers or cloud leaks.</span>
              </div>

              <div className="pillar-box">
                <Lock />
                <span className="pillar-title">Zero-Knowledge</span>
                <span className="pillar-desc">Keys reside in volatile RAM only; never cached in disk storage.</span>
              </div>

              <div className="pillar-box">
                <Award />
                <span className="pillar-title">NIST FIPS 197</span>
                <span className="pillar-desc">AES-256 standard symmetric cipher with Galois Authenticated mode.</span>
              </div>

              <div className="pillar-box">
                <Smartphone />
                <span className="pillar-title">Android First</span>
                <span className="pillar-desc">Mobile-first touch UX, gesture pill integration & viewport sizing.</span>
              </div>
            </div>
          </div>

          {/* Verified Cryptographic Engine Notice */}
          <div className="disclaimer-card">
            <strong style={{ color: 'var(--text-main)' }}>Cryptographic Guarantee & Privacy Notice:</strong>
            <p>
              File Guard executes real, authenticated AES-256-GCM encryption and decryption client-side in volatile memory using the W3C Web Cryptography API and 310,000 PBKDF2 iterations. Encryption keys and unencrypted file data are never stored in localStorage, cookies, or transmitted across any network.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
