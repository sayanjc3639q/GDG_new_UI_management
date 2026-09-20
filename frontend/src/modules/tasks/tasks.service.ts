import { apiClient } from '@/shared/lib/api-client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'REJECTED' | 'ACCEPTED' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assignedBy?: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: TaskStatus;
  dueDate: string;
  submissionLink?: string;
  submissionNotes?: string;
  submittedAt?: string;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  acceptedBy?: string;
  acceptedAt?: string;
  markedDoneBy?: string;
  markedDoneAt?: string;
  createdAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignee: string;
  assignedBy?: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
}

export class TasksService {
  static async getTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get<Task[]>('/tasks');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('[TasksService] Failed to load tasks from backend:', error);
    }
    return [];
  }

  static async createTask(dto: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create task');
  }

  static async updateTask(id: string, dto: Partial<Task>): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update task');
  }

  static async deleteTask(id: string): Promise<void> {
    const response = await apiClient.delete(`/tasks/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete task');
    }
  }
}
