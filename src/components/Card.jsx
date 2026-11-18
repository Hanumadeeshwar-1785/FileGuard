import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  highlight = false, 
  interactive = false, 
  onClick = null,
  ...props 
}) {
  const classes = [
    'cyber-card',
    highlight ? 'highlight' : '',
    interactive ? 'interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

