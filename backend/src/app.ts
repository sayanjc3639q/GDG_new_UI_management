import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './common/middlewares/logger.middleware';
import { errorHandler } from './common/middlewares/error.middleware';
import { NotFoundError } from './common/errors/app-error';
import { createApiRouter } from './routes';

export function createApp(): Application {
  const app = express();

  // Global Middlewares
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Root Welcome / Discovery
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'GDG Management Platform API',
      version: '1.0.0',
      documentation: '/api/v1',
      health: '/api/v1/health',
    });
  });

  // Mount API Modules
  app.use('/api/v1', createApiRouter());

  // 404 Route Catch-all
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
