import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
          background: 'var(--gdg-blue)',
          color: '#ffffff',
          border: '1px solid var(--gdg-blue)',
          fontWeight: 600,
        };
      case 'secondary':
        return {
          background: 'var(--bg-elevated)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          fontWeight: 500,
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          fontWeight: 500,
        };
      case 'danger':
        return {
          background: 'var(--gdg-red)',
          color: '#ffffff',
          border: '1px solid var(--gdg-red)',
          fontWeight: 600,
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
        return { padding: '6px 12px', fontSize: '0.8125rem', gap: '6px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '1rem', gap: '10px' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '0.875rem', gap: '8px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    userSelect: 'none',
    borderRadius: '0px',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button style={baseStyles} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
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
