import { apiClient } from '@/shared/lib/api-client';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignee: string;
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
}
