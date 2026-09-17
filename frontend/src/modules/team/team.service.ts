import { apiClient } from '@/shared/lib/api-client';
import { TeamMember, CreateMemberDto } from './team.types';

const defaultMockMembers: TeamMember[] = [
  {
    id: 'usr_1',
    name: 'Sayan Ghosh',
    email: 'lead@gdghit.com',
    role: 'LEAD',
    domain: 'AI/ML',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    joinedAt: '2025-08-01T00:00:00.000Z',
  },
  {
    id: 'usr_2',
    name: 'Priya Sharma',
    email: 'priya@gdghit.com',
    role: 'CO_LEAD',
    domain: 'Cloud',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    joinedAt: '2025-08-15T00:00:00.000Z',
  },
  {
    id: 'usr_3',
    name: 'Rahul Sen',
    email: 'rahul@gdghit.com',
    role: 'ORGANIZER',
    domain: 'Web',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    joinedAt: '2025-09-01T00:00:00.000Z',
  },
  {
    id: 'usr_4',
    name: 'Ananya Roy',
    email: 'ananya@gdghit.com',
    role: 'ORGANIZER',
    domain: 'Android',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    joinedAt: '2025-09-10T00:00:00.000Z',
  },
];

export class TeamService {
  static async getMembers(): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<TeamMember[]>('/users');
      if (response.success && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Fallback seamlessly
    }
    return defaultMockMembers;
  }

  static async createMember(dto: CreateMemberDto): Promise<TeamMember> {
    try {
      const response = await apiClient.post<TeamMember>('/users', dto);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback
    }

    const newMember: TeamMember = {
      id: `usr_${Date.now()}`,
      ...dto,
      joinedAt: new Date().toISOString(),
    };
    return newMember;
  }
}
