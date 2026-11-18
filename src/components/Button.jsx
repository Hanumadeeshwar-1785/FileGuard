import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick = null,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="stage-indicator-spinner" style={{ width: 16, height: 16 }} />
      ) : (
        Icon && <Icon size={18} />
      )}
      <span>{children}</span>
    </button>
  );
}

