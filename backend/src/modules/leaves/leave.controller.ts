import { Request, Response, NextFunction } from 'express';
import { LeaveService } from './leave.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.leaveService.getAllLeaves();
      ApiResponseUtil.success(res, list, 'Leave applications retrieved');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { applicantName, applicantRole, leaveType, startDate, endDate, reason, handoverPerson } = req.body;
      if (!applicantName || !startDate || !endDate || !reason) {
        throw new BadRequestError('Applicant name, start date, end date, and reason are required');
      }

      const created = await this.leaveService.createLeave({
        applicantName,
        applicantRole: applicantRole || 'Member',
        leaveType: leaveType || 'PERSONAL',
        startDate,
        endDate,
        reason,
        handoverPerson: handoverPerson || 'Chapter Lead',
      });

      ApiResponseUtil.created(res, created, 'Leave application submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        throw new BadRequestError('Valid status (PENDING, APPROVED, REJECTED) is required');
      }

      const updated = await this.leaveService.updateStatus(id, status);
      ApiResponseUtil.success(res, updated, 'Leave application status updated');
    } catch (error) {
      next(error);
    }
  };
}
