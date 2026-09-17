import { Router } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

export function createUsersRouter(): Router {
  const router = Router();
  const service = new UsersService();
  const controller = new UsersController(service);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
