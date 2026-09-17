import { Router } from 'express';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';

export function createLeavesRouter(): Router {
  const router = Router();
  const service = new LeaveService();
  const controller = new LeaveController(service);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.patch('/:id/status', controller.updateStatus);

  return router;
}
