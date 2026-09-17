import { Router } from 'express';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

export function createEventsRouter(): Router {
  const router = Router();
  const service = new EventsService();
  const controller = new EventsController(service);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
