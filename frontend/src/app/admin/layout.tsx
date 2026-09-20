'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/shared/context/auth-context';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Icon } from '@/shared/components/ui/icon';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <DashboardShell>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <Icon name="sync" size={24} className="spin" />
          <span>Verifying admin permissions...</span>
        </div>
      </DashboardShell>
    );
  }

  const isPrivileged =
    isAuthenticated &&
    user &&
    (user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR');

  if (!isPrivileged) {
    return (
      <DashboardShell>
        <div
          style={{
            maxWidth: '520px',
            margin: '80px auto',
            padding: '36px 32px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--md-error-container)',
              color: 'var(--gdg-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="lock" size={32} />
          </div>

          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--text-main)',
            }}
          >
            Access Denied
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Administrative control panels are restricted to <strong>Domain Seniors</strong> and{' '}
            <strong>Chapter Leads</strong>. Chapter members cannot modify administrative settings.
          </p>

          <Link
            href="/"
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gdg-blue)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            className="m3-interactive"
          >
            <Icon name="arrow_back" size={18} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return <>{children}</>;
}
