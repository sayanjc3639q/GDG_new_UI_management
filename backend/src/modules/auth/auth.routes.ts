import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

export function createAuthRouter(): Router {
  const router = Router();
  const service = new AuthService();
  const controller = new AuthController(service);

  router.post('/login', controller.login);
  router.post('/register', controller.register);

  return router;
}
