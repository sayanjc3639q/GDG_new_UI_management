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

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, date, time, meetLink, host, agenda, attendeesCount } = req.body;
      if (!title || !date || !time || !meetLink) {
        throw new BadRequestError('Title, date, time, and meetLink are required');
      }

      const meeting = await this.meetingService.createMeeting({
        title,
        date,
        time,
        meetLink,
        host: host || 'Chapter Lead',
        agenda,
        attendeesCount,
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
}
