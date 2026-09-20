'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/shared/context/auth-context';
import { config } from '@/config/env';
import { Icon } from '@/shared/components/ui/icon';
import { useTheme } from '@/shared/context/theme-context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginWithGoogle, loginWithPassword, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'google' | 'password'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    const initGoogle = () => {
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
        return;
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setErrorMsg(null);
              setSubmitting(true);
              const result = await loginWithGoogle(response.credential);
              if (!result.success) {
                setErrorMsg(result.error || 'Google authentication failed');
                setSubmitting(false);
              } else {
                router.push('/');
              }
            }
          },
          auto_select: false,
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }
      } catch (e) {
        console.error('Google GIS Init error:', e);
      }
    };

    const timer = setTimeout(initGoogle, 300);
    return () => clearTimeout(timer);
  }, [config.googleClientId, theme, loginWithGoogle, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    const result = await loginWithPassword(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      setSubmitting(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Theme switcher top right */}
      <div style={{ position: 'absolute', top: 20, right: 24 }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Icon name="light_mode" size={20} color="var(--gdg-yellow)" fill />
          ) : (
            <Icon name="dark_mode" size={20} color="var(--gdg-blue)" fill />
          )}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* GDG Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-blue)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-red)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-yellow)' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--gdg-green)' }} />
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: '0 0 6px 0',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          GDG Chapter Portal
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: '0 0 24px 0',
            textAlign: 'center',
          }}
        >
          Sign in to access tasks, meetings, leave management & chapter events.
        </p>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            background: 'var(--bg-sidebar)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '24px',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'google' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'google' ? 'var(--gdg-blue)' : 'var(--text-muted)',
              fontWeight: activeTab === 'google' ? 600 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'google' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon name="verified_user" size={16} />
            <span>Google Sign-In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: activeTab === 'password' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'password' ? 'var(--gdg-blue)' : 'var(--text-muted)',
              fontWeight: activeTab === 'password' ? 600 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'password' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon name="key" size={16} />
            <span>Email & Password</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {errorMsg && (
          <div
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--md-error-container)',
              color: 'var(--md-on-error-container)',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              border: '1px solid rgba(186, 26, 26, 0.2)',
            }}
          >
            <Icon name="error" size={18} color="var(--gdg-red)" />
            <div style={{ flex: 1 }}>{errorMsg}</div>
          </div>
        )}

        {/* Google Authentication View */}
        {activeTab === 'google' && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--md-primary-container)',
                color: 'var(--md-on-primary-container)',
                fontSize: '0.8125rem',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <Icon name="info" size={18} color="var(--gdg-blue)" />
              <div>
                <strong>Recommended for 1st-time login:</strong> Sign in with your Google account.
                You can configure your password directly from your <strong>Profile</strong> afterwards.
              </div>
            </div>

            {/* Google GSI Native Button Anchor */}
            <div
              ref={googleBtnRef}
              style={{
                minHeight: '44px',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            />

            {submitting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gdg-blue)', fontSize: '0.875rem' }}>
                <Icon name="sync" size={18} className="spin" />
                <span>Authenticating with Google...</span>
              </div>
            )}
          </div>
        )}

        {/* Email & Password Form View */}
        {activeTab === 'password' && (
          <form
            onSubmit={handlePasswordLogin}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@gdghit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)',
                    display: 'flex',
                  }}
                >
                  <Icon name="mail" size={18} />
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-subtle)',
                    display: 'flex',
                  }}
                >
                  <Icon name="lock" size={18} />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-subtle)',
                    display: 'flex',
                    padding: 0,
                  }}
                  aria-label="Toggle password visibility"
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--gdg-blue)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                transition: 'background 0.2s ease',
              }}
              className="m3-interactive"
            >
              {submitting ? (
                <>
                  <Icon name="sync" size={18} className="spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <Icon name="arrow_forward" size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          GDG on Campus HIT Chapter Portal &bull; Secure JWT Session
        </div>
      </div>
    </div>
  );
}
