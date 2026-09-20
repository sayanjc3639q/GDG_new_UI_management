export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    page?: number;
    limit?: number;
    total?: number;
  };
}

export type ThemeColor = 'blue' | 'red' | 'yellow' | 'green' | 'gray';

export type UserRole = 'MEMBER' | 'DOMAIN_SENIOR' | 'LEAD' | 'NON_MEMBER';

export type UserDomain =
  | 'Graphic Designer'
  | 'Video Editor'
  | 'Photographer'
  | 'Web Developer'
  | 'Content Writer'
  | 'Public Relation Manager'
  | 'App Developer'
  | 'Technical Member';

export type LeadTitle =
  | 'Organizer'
  | 'Co-Organizer'
  | 'Secretary'
  | 'Treasurer'
  | 'Domain Lead';

export type AuthProvider = 'google' | 'local' | 'both';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  authProvider?: AuthProvider;
  hasPassword: boolean;
  googleId?: string;
}

