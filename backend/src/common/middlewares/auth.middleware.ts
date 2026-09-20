import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { UserRole } from '../../modules/users/users.types';

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: UserRole;
  domain?: string;
  leadTitle?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    const decoded = jwt.verify(token, env.JWT.ACCESS_SECRET) as jwt.JwtPayload;

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedError('Invalid authentication token');
    }

    req.user = {
      id: decoded.sub as string,
      email: decoded.email as string,
      role: decoded.role as UserRole,
      domain: decoded.domain as string | undefined,
      leadTitle: decoded.leadTitle as string | undefined,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token has expired. Please refresh your session.'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid authentication token'));
    } else {
      next(error);
    }
  }
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated'));
    }

    // DEVELOPER has superadmin bypass: can access all endpoints
    if (req.user.role === 'DEVELOPER' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError('You do not have permission to access this resource'));
  };
};
