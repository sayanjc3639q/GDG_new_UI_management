'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/shared/components/ui/icon';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/auth-context';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/calendar')) return 'Calendar';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/meetings')) return 'Meetings';
    if (path.startsWith('/all') || path.startsWith('/features')) return 'All';
    if (path === '/leave') return 'Leave Application';
    if (path === '/profile') return 'Account Profile & Security';
    if (path === '/admin/leave') return 'Admin - Leave Approvals';
    if (path === '/admin/members') return 'Admin - Members Roster';
    if (path === '/admin/meetings') return 'Admin - Meetings Control';
    if (path === '/admin/tasks') return 'Admin - Tasks Control';
    if (path === '/admin/work-report') return 'Admin - Work Report';
    if (path === '/admin/notice') return 'Admin - Notice Broadcaster';
    if (path === '/admin/events') return 'Admin - Events Control';
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/events')) return 'Events';
    if (path.startsWith('/team')) return 'Team';
    return 'GDG Management';
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GD';

  return (
    <header
      className="header-container"
      style={{
        height: '64px',
        background: 'var(--bg-navbar)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 25,
      }}
    >
      {/* Left side: Mobile Admin Button & Page Title on Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link
          href="/admin"
          className="mobile-admin-btn m3-interactive"
          style={{
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: pathname === '/admin' ? 'var(--md-primary-container)' : 'var(--bg-card)',
            color: pathname === '/admin' ? 'var(--md-on-primary-container)' : 'var(--gdg-blue)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon name="admin_panel_settings" size={18} fill={pathname === '/admin'} />
          <span>ADMIN</span>
        </Link>

        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            margin: 0,
            fontFamily: 'var(--font-main)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Right side: Action Controls & Theme Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Light / Dark Mode Toggle Icon Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          className="m3-interactive"
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Icon name="light_mode" size={20} color="var(--gdg-yellow)" fill />
          ) : (
            <Icon name="dark_mode" size={20} color="var(--gdg-blue)" fill />
          )}
        </button>

        {/* Profile Dropdown Container or Login Button */}
        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 14px 4px 6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              className="m3-interactive"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--gdg-blue), #174ea6)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  overflow: 'hidden',
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    lineHeight: 1.2,
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                  {user.leadTitle || user.role}
                </span>
              </div>
              <Icon
                name={isProfileOpen ? 'expand_less' : 'expand_more'}
                size={18}
                color="var(--text-muted)"
              />
            </div>

            {/* Profile & Settings Dropdown Menu */}
            {isProfileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '240px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px 0',
                  zIndex: 50,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Header inside dropdown */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {user.email}
                  </span>
                </div>

                {/* Profile Option */}
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                  className="m3-interactive"
                >
                  <Icon name="person" size={20} color="var(--gdg-blue)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Profile & Security</span>
                    {!user.hasPassword && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--gdg-yellow)', fontWeight: 600 }}>
                        Set Password
                      </span>
                    )}
                  </div>
                </Link>

                {/* Leave Application Option */}
                <Link
                  href="/leave"
                  onClick={() => setIsProfileOpen(false)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-main)',
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                  className="m3-interactive"
                >
                  <Icon name="event_busy" size={20} color="var(--gdg-red)" />
                  <span>Leave Application</span>
                </Link>

                {/* Admin Link if role allows */}
                {(user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsProfileOpen(false)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text-main)',
                      textDecoration: 'none',
                      boxSizing: 'border-box',
                    }}
                    className="m3-interactive"
                  >
                    <Icon name="admin_panel_settings" size={20} color="var(--gdg-green)" />
                    <span>Admin Control</span>
                  </Link>
                )}

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '6px 0' }} />

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--gdg-red)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                  }}
                  className="m3-interactive"
                >
                  <Icon name="logout" size={20} color="var(--gdg-red)" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              background: 'var(--gdg-blue)',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
            className="m3-interactive"
          >
            <Icon name="login" size={18} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};

