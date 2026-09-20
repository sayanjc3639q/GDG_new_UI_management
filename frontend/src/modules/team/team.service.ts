import { apiClient } from '@/shared/lib/api-client';
import { TeamMember, CreateMemberDto, UpdateMemberDto } from './team.types';

export class TeamService {
  static async getMembers(): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<TeamMember[]>('/users');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('[TeamService] Failed to load members from backend:', error);
    }
    return [];
  }

  static async createMember(dto: CreateMemberDto): Promise<TeamMember> {
    const response = await apiClient.post<TeamMember>('/users', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create member');
  }

  static async updateMember(id: string, dto: UpdateMemberDto): Promise<TeamMember> {
    const response = await apiClient.patch<TeamMember>(`/users/${id}`, dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update member');
  }

  static async deleteMember(id: string): Promise<void> {
    const response = await apiClient.delete<void>(`/users/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete member');
    }
  }
}
