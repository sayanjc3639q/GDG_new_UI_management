import { Router } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { authenticate, requireRoles } from '../../common/middlewares/auth.middleware';

export function createTasksRouter(): Router {
  const router = Router();
  const service = new TaskService();
  const controller = new TaskController(service);

  router.get('/', controller.getAll);
  router.post('/', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.delete);

  return router;
}
