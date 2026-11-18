import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Vault, 
  Cpu, 
  CheckCircle2, 
  Activity, 
  Zap
} from 'lucide-react';
import TopAppBar from '../components/TopAppBar';
import BottomNav from '../components/BottomNav';
import { SECURITY_TOPICS } from '../utils/mockData';
import '../styles/screens/security.css';

export default function SecurityScreen() {
  const [activeTopicId, setActiveTopicId] = useState('all');

  const filteredTopics = activeTopicId === 'all' 
    ? SECURITY_TOPICS 
    : SECURITY_TOPICS.filter(t => t.id === activeTopicId);

  return (
    <>
      <TopAppBar title="Security Info" showBack={true} />

      <div className="android-screen-scrollable">
        <div className="security-screen-container">
          {/* Header Banner */}
          <div className="security-banner-card">
            <h2 className="security-banner-title">
              <ShieldCheck size={22} color="var(--cyan-primary)" />
              <span>Cryptographic Architecture</span>
            </h2>
            <p className="security-banner-subtitle">
              File Guard is built upon modern authenticated cryptography standards recommended by NIST and OWASP for zero-knowledge mobile storage.
            </p>
          </div>

          {/* Pipeline Visual Flow Diagram */}
          <div className="crypto-pipeline-diagram">
            <div className="diagram-header">
              <Activity size={14} />
              <span>END-TO-END ENCRYPTION LIFECYCLE</span>
            </div>

            <div className="pipeline-steps">
              <div className="pipeline-step">
                <div className="pipeline-step-number">1</div>
                <div className="pipeline-step-content">
                  <span className="pipeline-step-title">Entropy Generation (CSPRNG)</span>
                  <span className="pipeline-step-desc">16-byte random Salt + 12-byte unique Nonce/IV per file</span>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-number">2</div>
                <div className="pipeline-step-content">
                  <span className="pipeline-step-title">PBKDF2-HMAC-SHA256</span>
                  <span className="pipeline-step-desc">310,000 hash iterations convert passphrase into 256-bit AES master key</span>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-number">3</div>
                <div className="pipeline-step-content">
                  <span className="pipeline-step-title">AES-256-GCM Encryption</span>
                  <span className="pipeline-step-desc">Encrypts payload in Counter mode & computes 128-bit GMAC Auth Tag</span>
                </div>
              </div>

              <div className="pipeline-step">
                <div className="pipeline-step-number">4</div>
                <div className="pipeline-step-content">
                  <span className="pipeline-step-title">.fgvault Container Assembled</span>
                  <span className="pipeline-step-desc">Stores: Header + Salt + IV + Filename Meta + Ciphertext + Tag</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Topic Chips */}
          <div className="security-topic-chips">
            <button
              className={`topic-chip ${activeTopicId === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTopicId('all')}
            >
              <Zap size={13} />
              <span>All Standards</span>
            </button>
            <button
              className={`topic-chip ${activeTopicId === 'aes-256-gcm' ? 'active' : ''}`}
              onClick={() => setActiveTopicId('aes-256-gcm')}
            >
              <Cpu size={13} />
              <span>AES-256-GCM</span>
            </button>
            <button
              className={`topic-chip ${activeTopicId === 'pbkdf2-sha256' ? 'active' : ''}`}
              onClick={() => setActiveTopicId('pbkdf2-sha256')}
            >
              <KeyRound size={13} />
              <span>PBKDF2 & SHA-256</span>
            </button>
            <button
              className={`topic-chip ${activeTopicId === 'pbe-architecture' ? 'active' : ''}`}
              onClick={() => setActiveTopicId('pbe-architecture')}
            >
              <Vault size={13} />
              <span>Vault Format</span>
            </button>
          </div>

          {/* Topics Detailed Cards */}
          {filteredTopics.map((topic) => {
            let IconComponent = ShieldCheck;
            if (topic.id === 'pbkdf2-sha256') IconComponent = KeyRound;
            if (topic.id === 'pbe-architecture') IconComponent = Vault;

            return (
              <div key={topic.id} className="security-topic-card">
                <div className="topic-card-header">
                  <div className="topic-title-group">
                    <h3 className="topic-title">
                      <IconComponent size={20} color="var(--cyan-primary)" />
                      <span>{topic.title}</span>
                    </h3>
                    <span className="topic-subtitle">{topic.subtitle}</span>
                  </div>
                  <span className="status-badge secured" style={{ fontSize: '10px' }}>
                    {topic.badge}
                  </span>
                </div>

                {/* Key Points */}
                <div className="topic-points-list">
                  {topic.keyPoints.map((point, idx) => (
                    <div key={idx} className="topic-point-item">
                      <span className="point-heading">
                        <CheckCircle2 size={13} />
                        <span>{point.heading}</span>
                      </span>
                      <p className="point-description">
                        {point.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Technical Specifications Table */}
                {topic.technicalSpec && (
                  <div className="tech-spec-table">
                    {Object.entries(topic.technicalSpec).map(([key, val]) => (
                      <div key={key} className="tech-spec-row">
                        <span className="tech-spec-label">{key}</span>
                        <span className="tech-spec-value">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
