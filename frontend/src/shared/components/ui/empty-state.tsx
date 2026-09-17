import React from 'react';
import { Card } from './card';
import { Button } from './button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is nothing to see here yet. Create your first record below.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        border: '1px dashed var(--border-color)',
        background: 'var(--bg-card)',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-subtle)',
        }}
      >
        {icon || <Inbox size={24} />}
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} style={{ marginTop: '8px' }}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};
