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
      domain: d.domain,
      priority: d.priority,
      status: d.status,
      dueDate: d.dueDate,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const created: any = await TaskModel.create({
      title: dto.title,
      description: dto.description || '',
      assignee: dto.assignee,
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
      domain: created.domain,
      priority: created.priority,
      status: created.status,
      dueDate: created.dueDate,
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
      domain: updated.domain,
      priority: updated.priority,
      status: updated.status,
      dueDate: updated.dueDate,
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
