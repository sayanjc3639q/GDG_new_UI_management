import { apiClient } from '@/shared/lib/api-client';

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  meetLink: string;
  attendeesCount: number;
  host: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED';
  createdAt?: string;
}

export interface CreateMeetingDto {
  title: string;
  agenda?: string;
  date: string;
  time: string;
  meetLink: string;
  host: string;
  attendeesCount?: number;
}

export class MeetingsService {
  static async getMeetings(): Promise<Meeting[]> {
    try {
      const response = await apiClient.get<Meeting[]>('/meetings');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('[MeetingsService] Failed to load meetings from backend:', error);
    }
    return [];
  }

  static async createMeeting(dto: CreateMeetingDto): Promise<Meeting> {
    const response = await apiClient.post<Meeting>('/meetings', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to schedule meeting');
  }
}
