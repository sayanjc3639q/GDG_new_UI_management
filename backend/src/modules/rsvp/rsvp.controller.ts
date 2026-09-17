import { Request, Response, NextFunction } from 'express';
import { RsvpService } from './rsvp.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  getByEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const list = await this.rsvpService.getRsvpsByEvent(eventId);
      ApiResponseUtil.success(res, list);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId, userId, userName, userEmail } = req.body;
      if (!eventId || !userId || !userName || !userEmail) {
        throw new BadRequestError('eventId, userId, userName, and userEmail are required');
      }

      const rsvp = await this.rsvpService.createRsvp({ eventId, userId, userName, userEmail });
      ApiResponseUtil.created(res, rsvp, 'RSVP created successfully');
    } catch (error) {
      next(error);
    }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ticketCode } = req.body;
      if (!ticketCode) {
        throw new BadRequestError('Ticket code is required for check-in');
      }

      const rsvp = await this.rsvpService.checkIn({ ticketCode });
      ApiResponseUtil.success(res, rsvp, 'Check-in confirmed successfully');
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const rsvp = await this.rsvpService.cancelRsvp(id);
      ApiResponseUtil.success(res, rsvp, 'RSVP cancelled successfully');
    } catch (error) {
      next(error);
    }
  };
}
