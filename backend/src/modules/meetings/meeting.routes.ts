import { Router } from 'express';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { authenticate, requireRoles } from '../../common/middlewares/auth.middleware';

export function createMeetingsRouter(): Router {
  const router = Router();
  const service = new MeetingService();
  const controller = new MeetingController(service);

  router.get('/', controller.getAll);
  router.post('/', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.create);
  router.delete('/:id', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.delete);

  return router;
}
