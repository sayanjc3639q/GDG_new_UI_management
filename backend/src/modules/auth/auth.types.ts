import { UserRole, UserDomain, LeadTitle, AuthProvider } from '../users/users.types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  phone?: string;
  dob?: string;
  authProvider?: AuthProvider;
  hasPassword: boolean;
  googleId?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface GoogleLoginDto {
  credential: string; // Google ID Token
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  role?: UserRole;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
}

export interface SetPasswordDto {
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface ClientInfo {
  userAgent?: string;
  ipAddress?: string;
}

export function isMemberAccessAllowed(role: UserRole): boolean {
  return role === 'DEVELOPER' || role === 'LEAD' || role === 'DOMAIN_SENIOR' || role === 'MEMBER';
}

export function isLeadAdminAccessAllowed(role: UserRole): boolean {
  return role === 'DEVELOPER' || role === 'LEAD' || role === 'DOMAIN_SENIOR';
}

export function isDeveloperRole(role: UserRole): boolean {
  return role === 'DEVELOPER';
}
