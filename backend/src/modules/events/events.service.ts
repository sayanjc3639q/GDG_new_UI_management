import { NotFoundError } from '../../common/errors/app-error';
import { CreateEventDto, GDGEvent, UpdateEventDto } from './events.types';
import { EventModel } from './event.model';

export class EventsService {
  async getAllEvents(): Promise<GDGEvent[]> {
    const docs = await EventModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      type: d.type,
      status: d.status,
      bannerUrl: d.bannerUrl,
      startDate: d.startDate,
      endDate: d.endDate,
      location: d.location,
      isVirtual: d.isVirtual,
      meetingLink: d.meetingLink,
      capacity: d.capacity,
      tags: d.tags || [],
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async getEventById(id: string): Promise<GDGEvent> {
    const d: any = await EventModel.findById(id).lean();
    if (!d) {
      throw new NotFoundError(`Event with id ${id} not found`);
    }
    return {
      id: d._id.toString(),
      title: d.title,
      description: d.description,
      type: d.type,
      status: d.status,
      bannerUrl: d.bannerUrl,
      startDate: d.startDate,
      endDate: d.endDate,
      location: d.location,
      isVirtual: d.isVirtual,
      meetingLink: d.meetingLink,
      capacity: d.capacity,
      tags: d.tags || [],
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async createEvent(dto: CreateEventDto): Promise<GDGEvent> {
    const created: any = await EventModel.create({
      title: dto.title,
      description: dto.description || '',
      type: dto.type,
      status: 'UPCOMING',
      startDate: dto.startDate,
      endDate: dto.endDate || '',
      location: dto.location,
      isVirtual: dto.isVirtual ?? false,
      meetingLink: dto.meetingLink,
      capacity: dto.capacity,
      bannerUrl: dto.bannerUrl,
      tags: dto.tags || [],
    });

    return {
      id: created._id.toString(),
      title: created.title,
      description: created.description,
      type: created.type,
      status: created.status,
      startDate: created.startDate,
      endDate: created.endDate,
      location: created.location,
      isVirtual: created.isVirtual,
      meetingLink: created.meetingLink,
      capacity: created.capacity,
      tags: created.tags,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<GDGEvent> {
    const updated: any = await EventModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    if (!updated) {
      throw new NotFoundError(`Event with id ${id} not found`);
    }
    return {
      id: updated._id.toString(),
      title: updated.title,
      description: updated.description,
      type: updated.type,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      location: updated.location,
      isVirtual: updated.isVirtual,
      capacity: updated.capacity,
      tags: updated.tags,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteEvent(id: string): Promise<void> {
    const deleted = await EventModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Event with id ${id} not found`);
    }
  }
}
