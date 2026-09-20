import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authenticate } from '../../common/middlewares/auth.middleware';

export function createAuthRouter(): Router {
  const router = Router();
  const service = new AuthService();
  const controller = new AuthController(service);

  // Public authentication endpoints
  router.post('/google', controller.googleLogin);
  router.post('/login', controller.login);
  router.post('/register', controller.register);
  router.post('/refresh', controller.refresh);
  router.post('/logout', controller.logout);

  // Protected user session & password management endpoints
  router.get('/me', authenticate, controller.getMe);
  router.post('/set-password', authenticate, controller.setPassword);
  router.post('/change-password', authenticate, controller.changePassword);

  return router;
}
