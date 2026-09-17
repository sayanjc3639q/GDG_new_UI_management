import { Router } from 'express';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';

export function createMeetingsRouter(): Router {
  const router = Router();
  const service = new MeetingService();
  const controller = new MeetingController(service);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.delete('/:id', controller.delete);

  return router;
}
