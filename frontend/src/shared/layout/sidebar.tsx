'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/shared/components/ui/icon';

export const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    iconName: 'dashboard',
  },
  {
    label: 'Calendar',
    href: '/calendar',
    iconName: 'calendar_month',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    iconName: 'check_circle',
  },
  {
    label: 'Meetings',
    href: '/meetings',
    iconName: 'videocam',
  },
  {
    label: 'All',
    href: '/all',
    iconName: 'grid_view',
  },
  {
    label: 'ADMIN',
    href: '/admin',
    iconName: 'admin_panel_settings',
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: '260px',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 30,
        padding: '16px 12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Chapter Branding */}
      <div
        style={{
          padding: '12px 14px 20px 14px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="GDG Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>GDG</span>
            <span style={{ color: 'var(--gdg-blue)', fontWeight: 800 }}>Management</span>
          </div>
          <div
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Campus HIT
          </div>
        </div>
      </div>

      {/* Navigation Links - Core Management Rail including ADMIN */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAdmin = item.label === 'ADMIN';

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 16px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive
                  ? 'var(--md-on-primary-container)'
                  : isAdmin
                  ? 'var(--gdg-blue)'
                  : 'var(--text-muted)',
                background: isActive ? 'var(--md-primary-container)' : 'transparent',
                borderRadius: 'var(--radius-full)',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
              className="m3-interactive"
            >
              <Icon
                name={item.iconName}
                size={22}
                fill={isActive}
                color={
                  isActive
                    ? 'var(--md-on-primary-container)'
                    : isAdmin
                    ? 'var(--gdg-blue)'
                    : 'var(--text-subtle)'
                }
              />
              <span style={{ letterSpacing: '0.01em', fontWeight: isAdmin ? 700 : undefined }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
