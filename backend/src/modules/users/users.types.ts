export type UserRole = 'LEAD' | 'CO_LEAD' | 'ORGANIZER' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  domain?: 'AI/ML' | 'Web' | 'Android' | 'Cloud' | 'Cybersecurity' | 'Design';
  joinedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
  domain?: User['domain'];
  avatarUrl?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  domain?: User['domain'];
  avatarUrl?: string;
}
