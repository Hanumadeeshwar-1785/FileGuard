import React from 'react';

export default function ProgressBar({
  progress = 0,
  label = 'Processing Cryptographic Operation...',
  showPercentage = true,
  className = ''
}) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`cyber-progress-container ${className}`}>
      <div className="cyber-progress-header">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        {showPercentage && (
          <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>
            {clampedProgress}%
          </span>
        )}
      </div>
      <div className="cyber-progress-track">
        <div
          className="cyber-progress-fill"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

