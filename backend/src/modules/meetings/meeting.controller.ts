import { Request, Response, NextFunction } from 'express';
import { MeetingService } from './meeting.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const meetings = await this.meetingService.getAllMeetings();
      ApiResponseUtil.success(res, meetings, 'Meetings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const meeting = await this.meetingService.getMeetingById(id);
      ApiResponseUtil.success(res, meeting, 'Meeting details retrieved');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, date, time, mode, meetLink, location, host, agenda, attendeesCount, assignedInCharge } = req.body;
      if (!title || !date || !time) {
        throw new BadRequestError('Title, date, and time are required');
      }

      if (mode === 'OFFLINE' && !location) {
        throw new BadRequestError('Location is required for offline meetings');
      }

      const meeting = await this.meetingService.createMeeting({
        title,
        date,
        time,
        mode: mode || (meetLink ? 'ONLINE' : 'OFFLINE'),
        meetLink: meetLink || '',
        location: location || '',
        host: host || 'Chapter Lead',
        agenda,
        attendeesCount: attendeesCount || 5,
        assignedInCharge,
      });

      ApiResponseUtil.created(res, meeting, 'Meeting scheduled successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.meetingService.deleteMeeting(id);
      ApiResponseUtil.success(res, null, 'Meeting deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { attendance } = req.body;
      if (!Array.isArray(attendance)) {
        throw new BadRequestError('Attendance array is required');
      }

      const user = req.user ? {
        id: req.user.id,
        name: req.user.email ? req.user.email.split('@')[0] : 'Admin',
        role: req.user.role,
      } : { id: 'admin', name: 'Admin', role: 'DEVELOPER' };

      const updated = await this.meetingService.updateAttendance(id, attendance, user);
      ApiResponseUtil.success(res, updated, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  };

  updateMoM = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { content } = req.body;

      const user = req.user ? {
        id: req.user.id,
        name: req.user.email ? req.user.email.split('@')[0] : 'Admin',
        role: req.user.role,
      } : { id: 'admin', name: 'Admin', role: 'DEVELOPER' };

      const updated = await this.meetingService.updateMoM(id, content || '', user);
      ApiResponseUtil.success(res, updated, 'Minutes of Meeting (MoM) saved successfully');
    } catch (error) {
      next(error);
    }
  };
}
