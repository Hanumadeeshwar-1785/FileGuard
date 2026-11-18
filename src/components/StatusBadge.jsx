import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status = 'Secured', type = null, className = '' }) {
  let variant = 'secured';
  let Icon = ShieldCheck;

  const lower = (type || status).toLowerCase();

  if (lower.includes('secured') || lower.includes('encrypt') || lower.includes('protect')) {
    variant = 'secured';
    Icon = Lock;
  } else if (lower.includes('decrypt') || lower.includes('verif')) {
    variant = 'verified';
    Icon = CheckCircle2;
  } else if (lower.includes('warn') || lower.includes('pending')) {
    variant = 'warning';
    Icon = AlertTriangle;
  } else if (lower.includes('fail') || lower.includes('tamper') || lower.includes('error')) {
    variant = 'danger';
    Icon = AlertTriangle;
  } else {
    variant = 'muted';
    Icon = ShieldCheck;
  }

  return (
    <span className={`status-badge ${variant} ${className}`}>
      <Icon size={12} />
      <span>{status}</span>
    </span>
  );
}
