/**
 * Utilities for formatting file sizes, dates, and password metrics
 */

export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Just now';
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatFullDateTime(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function estimatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'None', color: 'var(--text-muted)', percent: 0 };
  
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: '#ef4444', percent: 25 };
  } else if (score === 2 || score === 3) {
    return { score: 2, label: 'Medium', color: '#f59e0b', percent: 55 };
  } else if (score === 4) {
    return { score: 3, label: 'Strong', color: '#10b981', percent: 80 };
  } else {
    return { score: 4, label: 'Military-Grade', color: '#00f0ff', percent: 100 };
  }
}

export function truncateFilename(name, maxLength = 20) {
  if (!name || name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex !== -1 && extIndex > name.length - 7) {
    const ext = name.slice(extIndex);
    const base = name.slice(0, extIndex);
    const avail = maxLength - ext.length - 3;
    if (avail > 3) {
      return `${base.slice(0, avail)}...${ext}`;
    }
  }
  return `${name.slice(0, maxLength - 3)}...`;
}

