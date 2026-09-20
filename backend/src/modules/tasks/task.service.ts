import { NotFoundError } from '../../common/errors/app-error';
import { CreateTaskDto, Task, UpdateTaskDto } from './task.types';
import { TaskModel } from './task.model';

export class TaskService {
  async getAllTasks(): Promise<Task[]> {
    const docs = await TaskModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      assignee: d.assignee,
      assignedBy: d.assignedBy || 'Lead Admin',
      domain: d.domain,
      priority: d.priority,
      status: d.status,
      dueDate: d.dueDate,
      submissionLink: d.submissionLink,
      submissionNotes: d.submissionNotes,
      submittedAt: d.submittedAt ? d.submittedAt.toISOString() : undefined,
      reviewComment: d.reviewComment,
      reviewedBy: d.reviewedBy,
      reviewedAt: d.reviewedAt ? d.reviewedAt.toISOString() : undefined,
      acceptedBy: d.acceptedBy,
      acceptedAt: d.acceptedAt ? d.acceptedAt.toISOString() : undefined,
      markedDoneBy: d.markedDoneBy,
      markedDoneAt: d.markedDoneAt ? d.markedDoneAt.toISOString() : undefined,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const created: any = await TaskModel.create({
      title: dto.title,
      description: dto.description || '',
      assignee: dto.assignee,
      assignedBy: dto.assignedBy || 'Lead Admin',
      domain: dto.domain,
      priority: dto.priority,
      status: 'TODO',
      dueDate: dto.dueDate,
    });

    return {
      id: created._id.toString(),
      title: created.title,
      description: created.description,
      assignee: created.assignee,
      assignedBy: created.assignedBy,
      domain: created.domain,
      priority: created.priority,
      status: created.status,
      dueDate: created.dueDate,
      submissionLink: created.submissionLink,
      submissionNotes: created.submissionNotes,
      submittedAt: created.submittedAt ? created.submittedAt.toISOString() : undefined,
      reviewComment: created.reviewComment,
      reviewedBy: created.reviewedBy,
      reviewedAt: created.reviewedAt ? created.reviewedAt.toISOString() : undefined,
      acceptedBy: created.acceptedBy,
      acceptedAt: created.acceptedAt ? created.acceptedAt.toISOString() : undefined,
      markedDoneBy: created.markedDoneBy,
      markedDoneAt: created.markedDoneAt ? created.markedDoneAt.toISOString() : undefined,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const updated: any = await TaskModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!updated) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
    return {
      id: updated._id.toString(),
      title: updated.title,
      description: updated.description,
      assignee: updated.assignee,
      assignedBy: updated.assignedBy,
      domain: updated.domain,
      priority: updated.priority,
      status: updated.status,
      dueDate: updated.dueDate,
      submissionLink: updated.submissionLink,
      submissionNotes: updated.submissionNotes,
      submittedAt: updated.submittedAt ? updated.submittedAt.toISOString() : undefined,
      reviewComment: updated.reviewComment,
      reviewedBy: updated.reviewedBy,
      reviewedAt: updated.reviewedAt ? updated.reviewedAt.toISOString() : undefined,
      acceptedBy: updated.acceptedBy,
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : undefined,
      markedDoneBy: updated.markedDoneBy,
      markedDoneAt: updated.markedDoneAt ? updated.markedDoneAt.toISOString() : undefined,
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await TaskModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }
  }
}
