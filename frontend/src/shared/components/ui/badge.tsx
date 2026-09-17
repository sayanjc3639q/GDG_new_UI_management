import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'blue':
        return {
          background: 'rgba(66, 133, 244, 0.12)',
          color: 'var(--gdg-blue)',
          border: '1px solid rgba(66, 133, 244, 0.3)',
        };
      case 'red':
        return {
          background: 'rgba(234, 67, 53, 0.12)',
          color: 'var(--gdg-red)',
          border: '1px solid rgba(234, 67, 53, 0.3)',
        };
      case 'yellow':
        return {
          background: 'rgba(251, 188, 4, 0.12)',
          color: 'var(--gdg-yellow)',
          border: '1px solid rgba(251, 188, 4, 0.3)',
        };
      case 'green':
        return {
          background: 'rgba(52, 168, 83, 0.12)',
          color: 'var(--gdg-green)',
          border: '1px solid rgba(52, 168, 83, 0.3)',
        };
      case 'purple':
        return {
          background: 'rgba(168, 85, 247, 0.12)',
          color: '#a855f7',
          border: '1px solid rgba(168, 85, 247, 0.3)',
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
    gap: '4px',
    borderRadius: '0px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: size === 'sm' ? '2px 6px' : '3px 8px',
    fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
    ...getVariantStyles(),
    ...style,
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};
