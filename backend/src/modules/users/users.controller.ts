import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.usersService.getAllUsers();
      ApiResponseUtil.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const user = await this.usersService.getUserById(id);
      ApiResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, role } = req.body;
      if (!name || !email || !role) {
        throw new BadRequestError('Name, email, and role are required');
      }

      const user = await this.usersService.createUser(req.body);
      ApiResponseUtil.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const user = await this.usersService.updateUser(id, req.body);
      ApiResponseUtil.success(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.usersService.deleteUser(id);
      ApiResponseUtil.success(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
