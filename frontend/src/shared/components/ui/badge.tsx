import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray' | 'purple';
  size?: 'sm' | 'md';
  pill?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  pill = true,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'blue':
        return {
          background: 'var(--md-primary-container)',
          color: 'var(--md-on-primary-container)',
          border: '1px solid transparent',
        };
      case 'red':
        return {
          background: 'var(--md-error-container)',
          color: 'var(--md-on-error-container)',
          border: '1px solid transparent',
        };
      case 'yellow':
        return {
          background: 'var(--md-warning-container)',
          color: 'var(--md-on-warning-container)',
          border: '1px solid transparent',
        };
      case 'green':
        return {
          background: 'var(--md-success-container)',
          color: 'var(--md-on-success-container)',
          border: '1px solid transparent',
        };
      case 'purple':
        return {
          background: 'var(--md-tertiary-container)',
          color: 'var(--md-tertiary)',
          border: '1px solid transparent',
        };
      case 'gray':
      default:
        return {
          background: 'var(--bg-elevated)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)',
        };
    }
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-sm)',
    fontWeight: 600,
    letterSpacing: '0.02em',
    padding: size === 'sm' ? '3px 10px' : '5px 12px',
    fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
    fontFamily: 'var(--font-main)',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};
