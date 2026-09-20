import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: error ? 'var(--md-error)' : 'var(--text-muted)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-subtle)',
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            height: '42px',
            background: 'var(--bg-input)',
            border: error ? '1.5px solid var(--md-error)' : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: leftIcon ? '0 12px 0 38px' : '0 14px',
            paddingRight: rightIcon ? '38px' : '14px',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-main)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--md-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 1px var(--md-primary)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
          {...props}
        />
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-subtle)',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--md-error)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
