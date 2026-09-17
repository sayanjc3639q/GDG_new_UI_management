import { NotFoundError } from '../../common/errors/app-error';
import { CreateMeetingDto, Meeting } from './meeting.types';
import { MeetingModel } from './meeting.model';

export class MeetingService {
  async getAllMeetings(): Promise<Meeting[]> {
    const docs = await MeetingModel.find().sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      id: d._id.toString(),
      title: d.title,
      agenda: d.agenda,
      date: d.date,
      time: d.time,
      meetLink: d.meetLink,
      attendeesCount: d.attendeesCount,
      host: d.host,
      status: d.status,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));
  }

  async createMeeting(dto: CreateMeetingDto): Promise<Meeting> {
    const created: any = await MeetingModel.create({
      title: dto.title,
      agenda: dto.agenda || '',
      date: dto.date,
      time: dto.time,
      meetLink: dto.meetLink,
      host: dto.host,
      attendeesCount: dto.attendeesCount || 5,
      status: 'UPCOMING',
    });

    return {
      id: created._id.toString(),
      title: created.title,
      agenda: created.agenda,
      date: created.date,
      time: created.time,
      meetLink: created.meetLink,
      host: created.host,
      attendeesCount: created.attendeesCount,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async deleteMeeting(id: string): Promise<void> {
    const deleted = await MeetingModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Meeting with id ${id} not found`);
    }
  }
}
