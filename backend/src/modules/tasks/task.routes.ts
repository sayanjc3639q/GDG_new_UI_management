import { Router } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

export function createTasksRouter(): Router {
  const router = Router();
  const service = new TaskService();
  const controller = new TaskController(service);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
