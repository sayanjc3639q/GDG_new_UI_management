import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError, UnauthorizedError } from '../../common/errors/app-error';
import { env } from '../../config/env';
import { ClientInfo } from './auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractClientInfo(req: Request): ClientInfo {
    return {
      userAgent: req.headers['user-agent'] || 'Unknown Browser',
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || 'Unknown IP',
    };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? 'strict' : 'lax',
      path: '/',
    });
  }

  googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { credential } = req.body;
      if (!credential) {
        throw new BadRequestError('Google credential token is required');
      }

      const clientInfo = this.extractClientInfo(req);
      const result = await this.authService.googleLogin({ credential }, clientInfo);

      this.setRefreshTokenCookie(res, result.tokens.refreshToken);
      ApiResponseUtil.success(res, result, 'Signed in with Google successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new BadRequestError('Email and password are required');
      }

      const clientInfo = this.extractClientInfo(req);
      const result = await this.authService.login({ email, password }, clientInfo);

      this.setRefreshTokenCookie(res, result.tokens.refreshToken);
      ApiResponseUtil.success(res, result, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, role, domain, leadTitle, avatarUrl } = req.body;
      if (!name || !email) {
        throw new BadRequestError('Name and email are required');
      }

      const clientInfo = this.extractClientInfo(req);
      const result = await this.authService.register(
        { name, email, password, role, domain, leadTitle, avatarUrl },
        clientInfo
      );

      this.setRefreshTokenCookie(res, result.tokens.refreshToken);
      ApiResponseUtil.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;
      if (!rawRefreshToken) {
        throw new UnauthorizedError('No refresh token provided');
      }

      const clientInfo = this.extractClientInfo(req);
      const result = await this.authService.refresh(rawRefreshToken, clientInfo);

      this.setRefreshTokenCookie(res, result.tokens.refreshToken);
      ApiResponseUtil.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      this.clearRefreshTokenCookie(res);
      next(error);
    }
  };

  setPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const { newPassword, confirmPassword } = req.body;
      const result = await this.authService.setPassword(userId, { newPassword, confirmPassword });

      ApiResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;
      const result = await this.authService.changePassword(userId, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      ApiResponseUtil.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;
      const userId = req.user?.id;

      await this.authService.logout(rawRefreshToken, userId);
      this.clearRefreshTokenCookie(res);

      ApiResponseUtil.success(res, { loggedOut: true }, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await this.authService.getMe(userId);
      ApiResponseUtil.success(res, user, 'Current user profile retrieved');
    } catch (error) {
      next(error);
    }
  };
}
