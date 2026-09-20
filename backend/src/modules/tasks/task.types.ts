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
  createdAt: string;
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

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  submissionLink?: string;
  submissionNotes?: string;
  submittedAt?: Date | string;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
  acceptedBy?: string;
  acceptedAt?: Date | string;
  markedDoneBy?: string;
  markedDoneAt?: Date | string;
}
