import { Router } from 'express';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { authenticate, requireRoles } from '../../common/middlewares/auth.middleware';

export function createMeetingsRouter(): Router {
  const router = Router();
  const service = new MeetingService();
  const controller = new MeetingController(service);

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.create);
  router.delete('/:id', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.delete);
  router.patch('/:id/attendance', authenticate, controller.updateAttendance);
  router.patch('/:id/mom', authenticate, controller.updateMoM);

  return router;
}
