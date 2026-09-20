import { NotFoundError, ConflictError } from '../../common/errors/app-error';
import { CreateUserDto, UpdateUserDto, User } from './users.types';
import { UserModel } from './user.model';

export class UsersService {
  async getAllUsers(): Promise<User[]> {
    const docs = await UserModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      gdgId: d.gdgId,
      name: d.name,
      email: d.email,
      role: d.role,
      domain: d.domain,
      leadTitle: d.leadTitle,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      authProvider: d.authProvider,
      hasPassword: Boolean(d.password),
      github: d.github,
      linkedin: d.linkedin,
      joinedAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async getUserById(id: string): Promise<User> {
    const d: any = await UserModel.findById(id).lean();
    if (!d) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return {
      id: d._id.toString(),
      gdgId: d.gdgId,
      name: d.name,
      email: d.email,
      role: d.role,
      domain: d.domain,
      leadTitle: d.leadTitle,
      avatarUrl: d.avatarUrl,
      bio: d.bio,
      authProvider: d.authProvider,
      hasPassword: Boolean(d.password),
      github: d.github,
      linkedin: d.linkedin,
      joinedAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await UserModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const created: any = await UserModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      gdgId: dto.gdgId,
      role: dto.role,
      domain: dto.domain,
      leadTitle: dto.role === 'LEAD' ? dto.leadTitle || 'Domain Lead' : undefined,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      github: dto.github,
      linkedin: dto.linkedin,
    });

    return {
      id: created._id.toString(),
      gdgId: created.gdgId,
      name: created.name,
      email: created.email,
      role: created.role,
      domain: created.domain,
      leadTitle: created.leadTitle,
      avatarUrl: created.avatarUrl,
      bio: created.bio,
      authProvider: created.authProvider,
      hasPassword: false,
      github: created.github,
      linkedin: created.linkedin,
      joinedAt: created.createdAt ? created.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const updates: any = { ...dto };
    if (dto.role && dto.role !== 'LEAD') {
      updates.leadTitle = null;
    }

    const updated: any = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return {
      id: updated._id.toString(),
      gdgId: updated.gdgId,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      domain: updated.domain,
      leadTitle: updated.leadTitle,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      authProvider: updated.authProvider,
      hasPassword: Boolean(updated.password),
      github: updated.github,
      linkedin: updated.linkedin,
      joinedAt: updated.createdAt ? updated.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await UserModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
  }
}
