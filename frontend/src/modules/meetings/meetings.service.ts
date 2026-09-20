import { apiClient } from '@/shared/lib/api-client';

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  domain?: string;
  isPresent: boolean;
  markedAt?: string;
}

export interface MeetingMoM {
  content: string;
  writtenBy?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  mode: 'ONLINE' | 'OFFLINE';
  meetLink?: string;
  location?: string;
  attendeesCount: number;
  host: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED';
  assignedInCharge?: {
    id: string;
    name: string;
    email?: string;
  };
  attendance?: AttendanceRecord[];
  attendanceLockedAt?: string;
  mom?: MeetingMoM;
  createdAt?: string;
}

export interface CreateMeetingDto {
  title: string;
  agenda?: string;
  date: string;
  time: string;
  mode?: 'ONLINE' | 'OFFLINE';
  meetLink?: string;
  location?: string;
  host: string;
  attendeesCount?: number;
  assignedInCharge?: {
    id: string;
    name: string;
    email?: string;
  };
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

  static async getMeetingById(id: string): Promise<Meeting | null> {
    try {
      const response = await apiClient.get<Meeting>(`/meetings/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error(`[MeetingsService] Failed to load meeting ${id}:`, error);
    }
    return null;
  }

  static async createMeeting(dto: CreateMeetingDto): Promise<Meeting> {
    const response = await apiClient.post<Meeting>('/meetings', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to schedule meeting');
  }

  static async deleteMeeting(id: string): Promise<void> {
    const response = await apiClient.delete(`/meetings/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete meeting');
    }
  }

  static async updateAttendance(id: string, attendance: AttendanceRecord[]): Promise<Meeting> {
    const response = await apiClient.patch<Meeting>(`/meetings/${id}/attendance`, { attendance });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update attendance');
  }

  static async updateMoM(id: string, content: string): Promise<Meeting> {
    const response = await apiClient.patch<Meeting>(`/meetings/${id}/mom`, { content });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to save Minutes of Meeting');
  }
}
