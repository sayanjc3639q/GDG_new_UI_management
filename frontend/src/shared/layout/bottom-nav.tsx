'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './sidebar';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
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
              gap: '3px',
              fontSize: '0.6875rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--gdg-blue)' : 'var(--text-muted)',
              borderTop: isActive ? '2px solid var(--gdg-blue)' : '2px solid transparent',
              background: isActive ? 'var(--bg-hover)' : 'transparent',
              transition: 'all 0.15s ease',
              padding: '4px 0',
            }}
          >
            {item.icon}
            <span style={{ fontSize: '0.625rem', whiteSpace: 'nowrap' }}>{item.label.split(' ')[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
};
