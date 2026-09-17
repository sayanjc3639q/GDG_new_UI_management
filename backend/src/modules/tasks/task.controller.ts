import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks();
      ApiResponseUtil.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, assignee, domain, priority, dueDate, description } = req.body;
      if (!title || !assignee || !dueDate) {
        throw new BadRequestError('Title, assignee, and dueDate are required');
      }

      const task = await this.taskService.createTask({
        title,
        assignee,
        domain: domain || 'General',
        priority: priority || 'MEDIUM',
        dueDate,
        description,
      });

      ApiResponseUtil.created(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const task = await this.taskService.updateTask(id, req.body);
      ApiResponseUtil.success(res, task, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.taskService.deleteTask(id);
      ApiResponseUtil.success(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
