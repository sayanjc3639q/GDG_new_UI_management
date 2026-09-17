import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { CreateUserDto, UpdateUserDto, User } from './users.types';

export class UsersService {
  private users: User[] = [
    {
      id: 'usr_1',
      name: 'John Doe',
      email: 'lead@gdghit.com',
      role: 'LEAD',
      domain: 'AI/ML',
      joinedAt: new Date().toISOString(),
    },
    {
      id: 'usr_2',
      name: 'Jane Smith',
      email: 'jane@gdghit.com',
      role: 'ORGANIZER',
      domain: 'Web',
      joinedAt: new Date().toISOString(),
    },
  ];

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async getUserById(id: string): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = this.users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase());
    if (existing) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      domain: dto.domain,
      avatarUrl: dto.avatarUrl,
      joinedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);
    Object.assign(user, dto);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}
