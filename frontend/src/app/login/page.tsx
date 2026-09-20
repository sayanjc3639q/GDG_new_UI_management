'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/auth-context';
import { config } from '@/config/env';
import { Icon } from '@/shared/components/ui/icon';
import { useTheme } from '@/shared/context/theme-context';

const GoogleGLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/**
 * Interactive "Slide to Log In" Component with Yellow (Authenticating) & Green (Checked) Transitions
 */
function SlideToLogin({
  onSlideComplete,
  isLoading,
  isSuccess,
  disabled,
  variant = 'default',
  text = 'Slide to Sign In',
}: {
  onSlideComplete: () => void;
  isLoading: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'google';
  text?: string;
}) {
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSlidToEnd, setIsSlidToEnd] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const getTrackBounds = useCallback(() => {
    if (!trackRef.current) return { maxDrag: 220, trackWidth: 280 };
    const trackWidth = trackRef.current.offsetWidth;
    const thumbWidth = 46;
    const maxDrag = Math.max(0, trackWidth - thumbWidth - 8);
    return { maxDrag, trackWidth };
  }, []);

  // Reset slider if error occurs or loading finishes without success
  useEffect(() => {
    if (!isLoading && !isSuccess && isSlidToEnd) {
      const timer = setTimeout(() => {
        setIsSlidToEnd(false);
        setSliderPos(0);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isSuccess, isSlidToEnd]);

  const triggerComplete = useCallback(() => {
    setIsSlidToEnd(true);
    if (typeof window !== 'undefined' && window.navigator && 'vibrate' in window.navigator) {
      try {
        window.navigator.vibrate(25);
      } catch {}
    }
    onSlideComplete();
  }, [onSlideComplete]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isLoading || isSuccess || isSlidToEnd) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX - sliderPos;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled || isLoading || isSuccess || isSlidToEnd) return;
    const { maxDrag } = getTrackBounds();
    const currentX = e.touches[0].clientX;
    const newPos = Math.max(0, Math.min(maxDrag, currentX - startXRef.current));
    setSliderPos(newPos);
  };

  const handleTouchEnd = () => {
    if (!isDragging || disabled || isLoading || isSuccess || isSlidToEnd) return;
    setIsDragging(false);
    const { maxDrag } = getTrackBounds();

    if (sliderPos >= maxDrag * 0.75) {
      setSliderPos(maxDrag);
      triggerComplete();
    } else {
      setSliderPos(0);
    }
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isLoading || isSuccess || isSlidToEnd) return;
    setIsDragging(true);
    startXRef.current = e.clientX - sliderPos;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled || isLoading || isSuccess || isSlidToEnd) return;
      const { maxDrag } = getTrackBounds();
      const newPos = Math.max(0, Math.min(maxDrag, e.clientX - startXRef.current));
      setSliderPos(newPos);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      const { maxDrag } = getTrackBounds();

      if (sliderPos >= maxDrag * 0.75) {
        setSliderPos(maxDrag);
        triggerComplete();
      } else {
        setSliderPos(0);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sliderPos, disabled, isLoading, isSuccess, isSlidToEnd, getTrackBounds, triggerComplete]);

  const { maxDrag } = getTrackBounds();
  const progressRatio = maxDrag > 0 ? sliderPos / maxDrag : 0;
  const isGoogle = variant === 'google';

  const isAuthenticating = (isLoading || isSlidToEnd) && !isSuccess;

  // Track Background Styling
  let trackBg = 'linear-gradient(90deg, rgba(26, 115, 232, 0.8), rgba(66, 133, 244, 0.95))';
  if (isSuccess) {
    trackBg = 'linear-gradient(90deg, #1e8e3e, #34a853)'; // Green
  } else if (isAuthenticating) {
    trackBg = 'linear-gradient(90deg, #f29900, #fbbc04)'; // Yellow
  } else if (isGoogle) {
    trackBg = 'linear-gradient(90deg, rgba(66, 133, 244, 0.15), rgba(66, 133, 244, 0.35))';
  }

  // Thumb Background Styling
  let thumbBg = 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)';
  let thumbBorder = 'none';
  let thumbColor = '#ffffff';

  if (isSuccess) {
    thumbBg = '#34a853'; // Green
    thumbBorder = 'none';
  } else if (isAuthenticating) {
    thumbBg = '#fbbc04'; // Yellow
    thumbBorder = 'none';
  } else if (isGoogle) {
    thumbBg = 'var(--bg-card)';
    thumbBorder = '1.5px solid var(--border-color)';
    thumbColor = 'inherit';
  }

  return (
    <div
      ref={trackRef}
      style={{
        width: '100%',
        height: '52px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-full)',
        border: '1.5px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Active Fill Track that follows the thumb */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${sliderPos + 46}px`,
          background: trackBg,
          borderRadius: 'var(--radius-full)',
          transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), background 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Shimmering Center Text (Idle) */}
      <div
        style={{
          position: 'absolute',
          left: '52px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          opacity: isAuthenticating || isSuccess ? 0 : Math.max(0.1, 1 - progressRatio * 1.5),
          transition: isDragging ? 'none' : 'opacity 0.25s ease',
          pointerEvents: 'none',
        }}
      >
        <span
          className="slide-to-login-shimmer"
          style={{
            fontSize: '0.84rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {text}
        </span>
        <Icon name="keyboard_double_arrow_right" size={18} color="var(--gdg-blue)" />
      </div>

      {/* Authenticating Text (Yellow state) */}
      {isAuthenticating && !isSuccess && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#202124',
            fontSize: '0.875rem',
            fontWeight: 700,
            zIndex: 3,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <Icon name="sync" size={18} className="spin" color="#202124" />
          <span>Authenticating...</span>
        </div>
      )}

      {/* Success Text (Green state) */}
      {isSuccess && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            zIndex: 3,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          <Icon name="check_circle" size={18} color="#ffffff" className="slide-check-pop" />
          <span>Authenticated!</span>
        </div>
      )}

      {/* Draggable Slider Thumb */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          left: '4px',
          transform: `translateX(${sliderPos}px)`,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: thumbBg,
          color: thumbColor,
          border: thumbBorder,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDragging
            ? isSuccess
              ? '0 4px 14px rgba(52, 168, 83, 0.5)'
              : isAuthenticating
              ? '0 4px 14px rgba(251, 188, 4, 0.5)'
              : '0 4px 14px rgba(26, 115, 232, 0.5)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
          cursor: disabled || isLoading || isSuccess ? 'not-allowed' : 'grab',
          transition: isDragging
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), background 0.4s ease, border 0.4s ease',
          zIndex: 4,
          touchAction: 'none',
        }}
        className={!isDragging && !isAuthenticating && !isSuccess ? 'slide-thumb-glow' : ''}
      >
        {isSuccess ? (
          <div className="slide-check-pop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={24} color="#ffffff" />
          </div>
        ) : isAuthenticating ? (
          <Icon name="sync" size={20} className="spin" color="#202124" />
        ) : isGoogle ? (
          <GoogleGLogo />
        ) : (
          <Icon name="arrow_forward" size={20} color="#ffffff" />
        )}
      </div>
    </div>
  );
}

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
  const [loginSuccess, setLoginSuccess] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Function to initialize Google GIS
  const renderGoogleButton = useCallback(() => {
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
              setLoginSuccess(false);
            } else {
              setLoginSuccess(true);
              setTimeout(() => {
                router.push('/');
              }, 600);
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
  }, [theme, loginWithGoogle, router]);

  // Run Google rendering on mount, theme change, or tab switch
  useEffect(() => {
    const timer = setTimeout(renderGoogleButton, 200);
    return () => clearTimeout(timer);
  }, [renderGoogleButton, activeTab]);

  const triggerGoogleSlideLogin = () => {
    if (typeof window === 'undefined') return;

    setErrorMsg(null);
    setSubmitting(true);

    // 1. Try to click the native GIS button
    if (googleBtnRef.current) {
      const btn = googleBtnRef.current.querySelector('div[role="button"]') as HTMLElement | null;
      if (btn) {
        btn.click();
        return;
      }
    }

    // 2. Fallback to GIS prompt
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setSubmitting(false);
        }
      });
    } else {
      setSubmitting(false);
    }
  };

  const executePasswordLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password before sliding.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    const result = await loginWithPassword(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      setSubmitting(false);
      setLoginSuccess(false);
    } else {
      setLoginSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 600);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    executePasswordLogin();
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
        padding: '24px 16px',
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
          maxWidth: '440px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 28px',
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
          Sign in to access tasks, meetings, leave management &amp; chapter events.
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
            <span>Email &amp; Password</span>
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
        <div
          style={{
            width: '100%',
            display: activeTab === 'google' ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
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

          {/* Single Unified "Slide with Google" Slider Component */}
          <div style={{ width: '100%' }}>
            <SlideToLogin
              onSlideComplete={triggerGoogleSlideLogin}
              isLoading={submitting || isLoading}
              isSuccess={loginSuccess}
              disabled={submitting || isLoading}
              variant="google"
              text="Slide with Google"
            />
          </div>

          {/* Hidden Google GSI Native Button (strictly for backend GIS callbacks) */}
          <div
            ref={googleBtnRef}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
            }}
          />
        </div>

        {/* Email & Password Form View */}
        <div style={{ width: '100%', display: activeTab === 'password' ? 'block' : 'none' }}>
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

            {/* "Slide to Log In" Component with Yellow & Green Transitions */}
            <div style={{ marginTop: '8px' }}>
              <SlideToLogin
                onSlideComplete={executePasswordLogin}
                isLoading={submitting || isLoading}
                isSuccess={loginSuccess}
                disabled={submitting || isLoading}
                variant="default"
                text="Slide to Sign In"
              />
            </div>
          </form>
        </div>

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
