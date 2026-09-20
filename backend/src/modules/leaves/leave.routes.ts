import { Router } from 'express';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { authenticate, requireRoles } from '../../common/middlewares/auth.middleware';

export function createLeavesRouter(): Router {
  const router = Router();
  const service = new LeaveService();
  const controller = new LeaveController(service);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.patch('/:id/status', authenticate, requireRoles('LEAD', 'DOMAIN_SENIOR'), controller.updateStatus);

  return router;
}
