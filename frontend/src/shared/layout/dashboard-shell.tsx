'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { BottomNav } from './bottom-nav';
import { useAuth } from '@/shared/context/auth-context';
import { Icon } from '@/shared/components/ui/icon';

export interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/login?redirect=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-blue)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-red)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-yellow)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-green)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gdg-blue)', fontSize: '0.9375rem', fontWeight: 600 }}>
          <Icon name="sync" size={20} className="spin" />
          <span>Verifying Chapter Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Avoid flashing protected content while router redirects
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <Navbar />
        <main className="main-content-container" style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};
