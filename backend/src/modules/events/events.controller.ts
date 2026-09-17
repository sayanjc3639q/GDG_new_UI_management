import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';
import { ApiResponseUtil } from '../../common/utils/api-response';
import { BadRequestError } from '../../common/errors/app-error';

export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = await this.eventsService.getAllEvents();
      ApiResponseUtil.success(res, events, 'Events retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const event = await this.eventsService.getEventById(id);
      ApiResponseUtil.success(res, event);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, type, startDate, endDate, location, capacity } = req.body;
      if (!title || !startDate || !location || !capacity) {
        throw new BadRequestError('Title, startDate, location, and capacity are required');
      }

      const event = await this.eventsService.createEvent(req.body);
      ApiResponseUtil.created(res, event, 'Event created successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const event = await this.eventsService.updateEvent(id, req.body);
      ApiResponseUtil.success(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.eventsService.deleteEvent(id);
      ApiResponseUtil.success(res, null, 'Event deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
