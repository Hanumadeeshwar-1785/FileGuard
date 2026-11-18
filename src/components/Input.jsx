import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { estimatePasswordStrength } from '../utils/formatters';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  icon: Icon = null,
  helperText = '',
  error = false,
  showStrength = false,
  matchValid = undefined, // boolean | undefined
  required = false,
  id,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const strength = showStrength && value ? estimatePasswordStrength(value) : null;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" htmlFor={id}>
          <span>{label} {required && <span style={{ color: 'var(--cyan-primary)' }}>*</span>}</span>
          {matchValid !== undefined && value && (
            <span className={`match-status ${matchValid ? 'valid' : 'invalid'}`}>
              {matchValid ? (
                <>
                  <Check size={12} /> Passwords Match
                </>
              ) : (
                <>
                  <X size={12} /> Passwords Do Not Match
                </>
              )}
            </span>
          )}
        </label>
      )}

      <div className="form-input-container">
        {Icon && <Icon size={17} className="form-input-icon" />}
        <input
          id={id}
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-input ${!Icon ? 'no-icon' : ''} ${isPassword ? 'has-suffix' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="form-input-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Password Strength Meter */}
      {strength && (
        <div className="password-strength-container">
          <div className="strength-meter-bar">
            <div
              className="strength-meter-fill"
              style={{
                width: `${strength.percent}%`,
                backgroundColor: strength.color
              }}
            />
          </div>
          <div className="strength-meter-label">
            <span style={{ color: 'var(--text-muted)' }}>Entropy / Strength:</span>
            <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
          </div>
        </div>
      )}

      {helperText && (
        <p className={`form-helper-text ${error ? 'error' : ''}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}

