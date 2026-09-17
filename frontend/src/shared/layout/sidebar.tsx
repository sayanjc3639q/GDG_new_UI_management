'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Video,
  FileText,
  Boxes,
} from 'lucide-react';

export const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: <Calendar size={18} />,
  },
  {
    label: 'Task',
    href: '/tasks',
    icon: <CheckSquare size={18} />,
  },
  {
    label: 'Meeting',
    href: '/meetings',
    icon: <Video size={18} />,
  },
  {
    label: 'Leave Application',
    href: '/leave',
    icon: <FileText size={18} />,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 30,
      }}
    >
      {/* Chapter Branding */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            background: 'var(--gdg-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <Boxes size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            GDG PORTAL
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Campus HIT
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '12px 0' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                background: isActive ? 'var(--bg-hover)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gdg-blue)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: isActive ? 'var(--gdg-blue)' : 'var(--text-subtle)' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>GDG HIT 2026</span>
        <span>Management System</span>
      </div>
    </aside>
  );
};
