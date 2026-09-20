import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { Icon } from './icon';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string | React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is nothing to see here yet. Create your first record below.',
  actionLabel,
  onAction,
  icon = 'inbox',
}) => {
  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        border: '1px dashed var(--border-color)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--md-surface-container-high)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--md-primary)',
        }}
      >
        {typeof icon === 'string' ? <Icon name={icon} size={28} /> : icon}
      </div>

      <div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} style={{ marginTop: '8px' }}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
