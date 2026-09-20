'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './sidebar';
import { Icon } from '@/shared/components/ui/icon';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  // Mobile bottom bar displays primary management items (excluding ADMIN which is in top bar)
  const mobileNavItems = navItems.filter((item) => item.label !== 'ADMIN');

  return (
    <nav className="mobile-bottom-nav">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              gap: '4px',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--md-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
              padding: '6px 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 16px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'var(--md-primary-container)' : 'transparent',
                color: isActive ? 'var(--md-on-primary-container)' : 'inherit',
                transition: 'background-color 0.2s ease',
              }}
            >
              <Icon
                name={item.iconName}
                size={20}
                fill={isActive}
                color={isActive ? 'var(--md-on-primary-container)' : 'var(--text-subtle)'}
              />
            </div>
            <span style={{ fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>
              {item.label.split(' ')[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
