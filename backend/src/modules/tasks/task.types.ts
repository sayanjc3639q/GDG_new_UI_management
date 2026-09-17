export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignee: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
}
