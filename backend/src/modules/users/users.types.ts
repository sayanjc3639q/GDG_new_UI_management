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

export interface User {
  id: string;
  gdgId?: string;
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
  hasPassword?: boolean;
  googleId?: string;
  joinedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  googleId?: string;
  authProvider?: AuthProvider;
  gdgId?: string;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  gdgId?: string;
  role?: UserRole;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
}
