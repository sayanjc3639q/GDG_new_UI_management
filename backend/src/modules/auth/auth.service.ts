import { UnauthorizedError, ConflictError } from '../../common/errors/app-error';
import { env } from '../../config/env';
import { AuthResponse, AuthUser, LoginDto, RegisterDto } from './auth.types';

export class AuthService {
  // In a full implementation, this interacts with a DB Repository (e.g. Prisma/Drizzle)
  private mockUsers: AuthUser[] = [
    {
      id: 'usr_1',
      name: 'GDG Lead',
      email: 'lead@gdghit.com',
      role: 'LEAD',
    },
  ];

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = this.mockUsers.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return {
      user,
      tokens: {
        accessToken: `mock-jwt-token-for-${user.id}`,
        expiresIn: env.JWT.EXPIRES_IN,
      },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = this.mockUsers.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: dto.role || 'MEMBER',
    };

    this.mockUsers.push(newUser);

    return {
      user: newUser,
      tokens: {
        accessToken: `mock-jwt-token-for-${newUser.id}`,
        expiresIn: env.JWT.EXPIRES_IN,
      },
    };
  }
}
