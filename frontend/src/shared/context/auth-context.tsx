'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import { AuthUser } from '../types';

const USER_STORAGE_KEY = 'gdg_auth_user';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setPassword: (newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: {
    name?: string;
    domain?: string;
    avatarUrl?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const persistUser = (userData: AuthUser | null) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      if (userData) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        persistUser(null);
        return;
      }
      const response = await apiClient.get<AuthUser>('/auth/me');
      if (response.success && response.data) {
        persistUser(response.data);
      }
    } catch (error) {
      console.warn('[AuthContext] Failed to fetch current user profile:', error);
    }
  }, []);

  // Initialize Auth state from localStorage & verify with server
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const token = apiClient.getToken();

        if (storedUser && token) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
          await refreshProfile();
        } else if (token) {
          await refreshProfile();
        }
      } catch (e) {
        console.error('[AuthContext] Auth initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshProfile]);

  const loginWithGoogle = async (credential: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post<{ user: AuthUser; tokens: { accessToken: string } }>(
        '/auth/google',
        { credential }
      );

      if (res.success && res.data) {
        apiClient.setToken(res.data.tokens.accessToken);
        persistUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Google sign-in failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post<{ user: AuthUser; tokens: { accessToken: string } }>(
        '/auth/login',
        { email, password }
      );

      if (res.success && res.data) {
        apiClient.setToken(res.data.tokens.accessToken);
        persistUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const setPassword = async (newPassword: string, confirmPassword?: string) => {
    try {
      const res = await apiClient.post<{ success: boolean; message: string; user: AuthUser }>(
        '/auth/set-password',
        { newPassword, confirmPassword }
      );

      if (res.success && res.data) {
        if (res.data.user) {
          persistUser(res.data.user);
        } else {
          await refreshProfile();
        }
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to set password' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to set password' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string
  ) => {
    try {
      const res = await apiClient.post<{ success: boolean; message: string; user: AuthUser }>(
        '/auth/change-password',
        { currentPassword, newPassword, confirmPassword }
      );

      if (res.success && res.data) {
        if (res.data.user) {
          persistUser(res.data.user);
        } else {
          await refreshProfile();
        }
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to change password' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to change password' };
    }
  };

  const updateProfile = async (data: {
    name?: string;
    domain?: string;
    avatarUrl?: string;
    bio?: string;
    github?: string;
    linkedin?: string;
  }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const res = await apiClient.patch<AuthUser>(`/users/${user.id}`, data);
      if (res.success && res.data) {
        persistUser({ ...user, ...res.data });
        return { success: true };
      }
      return { success: false, error: res.message || 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('[AuthContext] Logout request error:', err);
    } finally {
      apiClient.setToken(null);
      persistUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithPassword,
        setPassword,
        changePassword,
        updateProfile,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
