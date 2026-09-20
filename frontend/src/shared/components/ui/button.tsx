import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--md-primary)',
          color: 'var(--md-on-primary)',
          border: '1px solid transparent',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'tonal':
        return {
          background: 'var(--md-primary-container)',
          color: 'var(--md-on-primary-container)',
          border: '1px solid transparent',
        };
      case 'secondary':
        return {
          background: 'var(--bg-elevated)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--md-primary)',
          border: '1px solid var(--border-color)',
        };
      case 'danger':
        return {
          background: 'var(--md-error)',
          color: '#ffffff',
          border: '1px solid transparent',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-muted)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '0.8125rem', gap: '6px', height: '32px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem', gap: '10px', height: '48px' };
      case 'md':
      default:
        return { padding: '8px 18px', fontSize: '0.875rem', gap: '8px', height: '40px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
    userSelect: 'none',
    borderRadius: 'var(--radius-full)',
    fontWeight: 500,
    fontFamily: 'var(--font-main)',
    letterSpacing: '0.015em',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button style={baseStyles} disabled={disabled || isLoading} className={`m3-interactive ${className}`} {...props}>
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
