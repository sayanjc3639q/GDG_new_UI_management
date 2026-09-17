import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
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
          style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '10px',
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
            background: 'var(--bg-input)',
            border: error ? '1px solid var(--gdg-red)' : '1px solid var(--border-color)',
            borderRadius: '0px',
            padding: leftIcon ? '9px 12px 9px 34px' : '9px 12px',
            color: 'var(--text-main)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--gdg-red)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
