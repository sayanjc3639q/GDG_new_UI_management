import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { ApiResponseUtil } from '../utils/api-response';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`Operational Error: ${err.message}`, {
      statusCode: err.statusCode,
      details: err.details,
    });
    ApiResponseUtil.error(res, err.message, err.statusCode, err.details);
    return;
  }

  logger.error('Unhandled System Exception:', err);

  const message = env.isProduction ? 'Internal server error' : err.message;
  const details = env.isProduction ? undefined : { stack: err.stack };

  ApiResponseUtil.error(res, message, 500, details);
};
