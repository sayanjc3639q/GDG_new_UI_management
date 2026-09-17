export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'LEAD' | 'CO_LEAD' | 'ORGANIZER' | 'MEMBER';
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password?: string;
  role?: 'LEAD' | 'CO_LEAD' | 'ORGANIZER' | 'MEMBER';
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
