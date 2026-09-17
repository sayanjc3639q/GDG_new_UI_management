'use client';

import React from 'react';
import { Sun, Moon, Bell, Search, Layers } from 'lucide-react';
import { useTheme } from '../context/theme-context';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="header-container"
      style={{
        height: '64px',
        background: 'var(--bg-navbar)',
        backdropFilter: 'blur(8px)',
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
      {/* Mobile Branding / Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            padding: '6px 12px',
            width: '260px',
          }}
        >
          <Search size={15} color="var(--text-subtle)" />
          <input
            placeholder="Search records..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Action Controls & Theme Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="var(--gdg-yellow)" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="var(--gdg-blue)" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          <Bell size={16} />
        </button>

        {/* User Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              background: 'var(--gdg-blue)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            AD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              Admin
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Chapter Lead
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
