import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  accentColor?: 'blue' | 'red' | 'yellow' | 'green' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  accentColor = 'none',
  style,
  className = '',
  ...props
}) => {
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'blue':
        return '2px solid var(--gdg-blue)';
      case 'red':
        return '2px solid var(--gdg-red)';
      case 'yellow':
        return '2px solid var(--gdg-yellow)';
      case 'green':
        return '2px solid var(--gdg-green)';
      default:
        return '1px solid var(--border-color)';
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    borderRadius: '0px',
    border: '1px solid var(--border-color)',
    borderLeft: accentColor !== 'none' ? getAccentBorder() : '1px solid var(--border-color)',
    padding: '20px',
    position: 'relative',
    transition: 'border-color 0.15s ease, background 0.15s ease',
    ...style,
  };

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  );
};
