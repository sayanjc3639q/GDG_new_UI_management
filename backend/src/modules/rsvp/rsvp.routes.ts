import { Router } from 'express';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';

export function createRsvpRouter(): Router {
  const router = Router();
  const service = new RsvpService();
  const controller = new RsvpController(service);

  router.get('/event/:eventId', controller.getByEvent);
  router.post('/', controller.create);
  router.post('/check-in', controller.checkIn);
  router.patch('/:id/cancel', controller.cancel);

  return router;
}
