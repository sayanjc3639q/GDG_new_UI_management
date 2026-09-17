import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email) {
        throw new BadRequestError('Email is required');
      }

      const result = await this.authService.login({ email, password });
      ApiResponseUtil.success(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email) {
        throw new BadRequestError('Name and email are required');
      }

      const result = await this.authService.register({ name, email, password, role });
      ApiResponseUtil.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };
}
