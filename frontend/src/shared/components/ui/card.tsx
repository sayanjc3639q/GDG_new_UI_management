import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  accentColor?: 'blue' | 'red' | 'yellow' | 'green' | 'none';
  variant?: 'elevated' | 'filled' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  accentColor = 'none',
  variant = 'outlined',
  style,
  className = '',
  ...props
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'blue':
        return '3px solid var(--gdg-blue)';
      case 'red':
        return '3px solid var(--gdg-red)';
      case 'yellow':
        return '3px solid var(--gdg-yellow)';
      case 'green':
        return '3px solid var(--gdg-green)';
      default:
        return '1px solid var(--border-color)';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'elevated':
        return {
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
        };
      case 'filled':
        return {
          background: 'var(--bg-elevated)',
          border: '1px solid transparent',
        };
      case 'outlined':
      default:
        return {
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        };
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
    borderLeft: accentColor !== 'none' ? getAccentBorder() : undefined,
    ...getVariantStyles(),
    ...style,
  };

  return (
    <div
      style={cardStyle}
      className={`${hoverEffect ? 'm3-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
