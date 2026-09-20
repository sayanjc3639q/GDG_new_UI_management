import { Router } from 'express';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { authenticate, requireRoles } from '../../common/middlewares/auth.middleware';

export function createEventsRouter(): Router {
  const router = Router();
  const service = new EventsService();
  const controller = new EventsController(service);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.create);
  router.patch('/:id', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.update);
  router.delete('/:id', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.delete);

  return router;
}
