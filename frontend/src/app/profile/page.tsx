'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { useAuth } from '@/shared/context/auth-context';
import { Icon } from '@/shared/components/ui/icon';
import { normalizeGithubUrl, normalizeLinkedinUrl } from '@/shared/lib/url-normalizer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setPassword, changePassword, updateProfile, logout } = useAuth();

  // Password setting / changing state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile details state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [domain, setDomain] = useState(user?.domain || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync state when user loads
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setGithub(user.github || '');
      setLinkedin(user.linkedin || '');
      setPhone(user.phone || '');
      setDob(user.dob || '');
      setDomain(user.domain || '');
    }
  }, [user]);

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
          <span>Loading profile details...</span>
        </div>
      </DashboardShell>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <DashboardShell>
        <div
          style={{
            maxWidth: '500px',
            margin: '80px auto',
            padding: '32px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Icon name="lock" size={48} color="var(--gdg-blue)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '16px 0 8px' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Please sign in to view and manage your chapter profile and security settings.
          </p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gdg-blue)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Login
          </button>
        </div>
      </DashboardShell>
    );
  }

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleSetOrChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setPasswordMsg({
        type: 'error',
        text: 'Password must be at least 8 characters and contain both letters and numbers.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      if (!user.hasPassword) {
        // Setting password for the first time (after Google Sign-in)
        const res = await setPassword(newPassword, confirmPassword);
        if (res.success) {
          setPasswordMsg({
            type: 'success',
            text: 'Password set successfully! You can now log in using your email and password.',
          });
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordMsg({ type: 'error', text: res.error || 'Failed to set password.' });
        }
      } else {
        // Changing existing password
        if (!currentPassword) {
          setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
          setPasswordLoading(false);
          return;
        }

        const res = await changePassword(currentPassword, newPassword, confirmPassword);
        if (res.success) {
          setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordMsg({ type: 'error', text: res.error || 'Failed to change password.' });
        }
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    // Validate and normalize GitHub
    let normalizedGithub = '';
    if (github && github.trim()) {
      const res = normalizeGithubUrl(github);
      if (res.error) {
        setProfileMsg({ type: 'error', text: res.error });
        return;
      }
      normalizedGithub = res.url;
    }

    // Validate and normalize LinkedIn
    let normalizedLinkedin = '';
    if (linkedin && linkedin.trim()) {
      const res = normalizeLinkedinUrl(linkedin);
      if (res.error) {
        setProfileMsg({ type: 'error', text: res.error });
        return;
      }
      normalizedLinkedin = res.url;
    }

    setProfileLoading(true);

    try {
      const res = await updateProfile({
        name,
        bio,
        github: normalizedGithub || undefined,
        linkedin: normalizedLinkedin || undefined,
        phone,
        dob,
        domain: domain as any,
      });

      if (res.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setProfileMsg({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {/* Top Profile Header Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '28px',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Avatar Icon / Initial */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gdg-blue), #174ea6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user.name?.slice(0, 2).toUpperCase() || 'GD'
            )}
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {user.name}
              </h1>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--md-primary-container)',
                  color: 'var(--md-on-primary-container)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {user.role}
              </span>
              {user.leadTitle && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--md-secondary-container)',
                    color: 'var(--md-on-secondary-container)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {user.leadTitle}
                </span>
              )}
            </div>

            <p style={{ margin: '6px 0 10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {user.email}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {user.domain && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <Icon name="work" size={16} color="var(--gdg-blue)" />
                  <span>{user.domain}</span>
                </div>
              )}

              {user.phone && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <Icon name="call" size={16} color="var(--gdg-green)" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user.dob && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <Icon name="cake" size={16} color="var(--gdg-yellow)" />
                  <span>{user.dob}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: user.hasPassword ? 'var(--gdg-green)' : 'var(--gdg-yellow)',
                  fontWeight: 500,
                }}
              >
                <Icon
                  name={user.hasPassword ? 'check_circle' : 'pending'}
                  size={16}
                  color={user.hasPassword ? 'var(--gdg-green)' : 'var(--gdg-yellow)'}
                />
                <span>
                  {user.hasPassword
                    ? 'Email & Password Active'
                    : 'Google Sign-In (Password Not Set)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              color: 'var(--gdg-red)',
              border: '1px solid rgba(217, 48, 37, 0.3)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="m3-interactive"
          >
            <Icon name="logout" size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* 1. Password & Authentication Management Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--md-primary-container)',
                  color: 'var(--gdg-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="key" size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  {user.hasPassword ? 'Change Password' : 'Set Account Password'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user.hasPassword
                    ? 'Update your email login credentials'
                    : 'Enable direct login with your email and password'}
                </span>
              </div>
            </div>

            {/* Notification Banner for Google Users */}
            {!user.hasPassword && (
              <div
                style={{
                  padding: '12px 14px',
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
                <Icon name="verified_user" size={18} color="var(--gdg-blue)" />
                <div>
                  <strong>First-Time Setup:</strong> You logged in using your Google Account.
                  Set a password below so you can sign in directly using <strong>{user.email}</strong> anytime.
                </div>
              </div>
            )}

            {passwordMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background:
                    passwordMsg.type === 'success'
                      ? 'var(--md-success-container)'
                      : 'var(--md-error-container)',
                  color:
                    passwordMsg.type === 'success'
                      ? 'var(--md-on-success-container)'
                      : 'var(--md-on-error-container)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon
                  name={passwordMsg.type === 'success' ? 'check_circle' : 'error'}
                  size={18}
                />
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSetOrChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {user.hasPassword && (
                <div>
                  <label
                    htmlFor="currentPassword"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 38px 10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
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
                    >
                      <Icon name={showCurrentPassword ? 'visibility_off' : 'visibility'} size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="newPassword"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  {user.hasPassword ? 'New Password' : 'Create Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 8 characters (letters & numbers)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                  >
                    <Icon name={showNewPassword ? 'visibility_off' : 'visibility'} size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Password Requirements Checklist */}
              {newPassword.length > 0 && (
                <div
                  style={{
                    background: 'var(--bg-sidebar)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Requirements:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLength ? 'var(--gdg-green)' : 'var(--text-subtle)' }}>
                    <Icon name={hasMinLength ? 'check' : 'close'} size={14} />
                    <span>At least 8 characters</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLetter ? 'var(--gdg-green)' : 'var(--text-subtle)' }}>
                    <Icon name={hasLetter ? 'check' : 'close'} size={14} />
                    <span>Contains at least one letter</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumber ? 'var(--gdg-green)' : 'var(--text-subtle)' }}>
                    <Icon name={hasNumber ? 'check' : 'close'} size={14} />
                    <span>Contains at least one number</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordsMatch ? 'var(--gdg-green)' : 'var(--text-subtle)' }}>
                    <Icon name={passwordsMatch ? 'check' : 'close'} size={14} />
                    <span>Passwords match</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading || (newPassword.length > 0 && !isPasswordValid)}
                style={{
                  marginTop: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gdg-blue)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  opacity: passwordLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                className="m3-interactive"
              >
                {passwordLoading ? (
                  <>
                    <Icon name="sync" size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="lock" size={16} />
                    <span>{user.hasPassword ? 'Update Password' : 'Save & Enable Password'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. Personal Profile & Links Card */}
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--md-secondary-container)',
                  color: 'var(--md-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="person" size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Profile Information
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Manage your personal details and social links
                </span>
              </div>
            </div>

            {profileMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background:
                    profileMsg.type === 'success'
                      ? 'var(--md-success-container)'
                      : 'var(--md-error-container)',
                  color:
                    profileMsg.type === 'success'
                      ? 'var(--md-on-success-container)'
                      : 'var(--md-on-error-container)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon
                  name={profileMsg.type === 'success' ? 'check_circle' : 'error'}
                  size={18}
                />
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="domain"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Domain / Specialization
                </label>
                <select
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select Domain</option>
                  <option value="Web Developer">Web Developer</option>
                  <option value="App Developer">App Developer</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                  <option value="Video Editor">Video Editor</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Content Writer">Content Writer</option>
                  <option value="Public Relation Manager">Public Relation Manager</option>
                  <option value="Technical Member">Technical Member</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Bio / About
                </label>
                <textarea
                  id="bio"
                  rows={2}
                  placeholder="Tell chapter members about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label
                    htmlFor="phone"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="dob"
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="github"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  GitHub URL / Username
                </label>
                <input
                  id="github"
                  type="text"
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="linkedin"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  LinkedIn URL
                </label>
                <input
                  id="linkedin"
                  type="text"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  marginTop: '8px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)',
                }}
                className="m3-interactive"
              >
                {profileLoading ? (
                  <>
                    <Icon name="sync" size={16} className="spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="save" size={16} />
                    <span>Update Profile Details</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
