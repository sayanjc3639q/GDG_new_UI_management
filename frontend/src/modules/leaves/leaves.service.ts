import { apiClient } from '@/shared/lib/api-client';

export type LeaveType = 'EXAM_PREPARATION' | 'MEDICAL' | 'PERSONAL' | 'ACADEMIC_PROJECT';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveApplication {
  id: string;
  applicantName: string;
  applicantRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverPerson: string;
  status: LeaveStatus;
  createdAt?: string;
}

export interface CreateLeaveDto {
  applicantName: string;
  applicantRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverPerson: string;
}

export class LeavesService {
  static async getLeaves(): Promise<LeaveApplication[]> {
    try {
      const response = await apiClient.get<LeaveApplication[]>('/leaves');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('[LeavesService] Failed to load leaves from backend:', error);
    }
    return [];
  }

  static async createLeave(dto: CreateLeaveDto): Promise<LeaveApplication> {
    const response = await apiClient.post<LeaveApplication>('/leaves', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to submit leave application');
  }

  static async updateStatus(id: string, status: LeaveStatus): Promise<LeaveApplication> {
    const response = await apiClient.patch<LeaveApplication>(`/leaves/${id}/status`, { status });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update leave status');
  }
}
