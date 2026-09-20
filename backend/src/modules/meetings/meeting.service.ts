import { NotFoundError, ForbiddenError } from '../../common/errors/app-error';
import { CreateMeetingDto, Meeting, AttendanceRecord } from './meeting.types';
import { MeetingModel } from './meeting.model';

export class MeetingService {
  private formatMeetingDoc(d: any): Meeting {
    return {
      id: d._id.toString(),
      title: d.title,
      agenda: d.agenda || '',
      date: d.date,
      time: d.time,
      mode: d.mode || 'ONLINE',
      meetLink: d.meetLink || '',
      location: d.location || '',
      attendeesCount: d.attendeesCount || 5,
      host: d.host || 'Chapter Lead',
      status: d.status || 'UPCOMING',
      assignedInCharge: d.assignedInCharge ? {
        id: d.assignedInCharge.id,
        name: d.assignedInCharge.name,
        email: d.assignedInCharge.email,
      } : undefined,
      attendance: d.attendance?.map((a: any) => ({
        memberId: a.memberId,
        memberName: a.memberName,
        domain: a.domain,
        isPresent: Boolean(a.isPresent),
        markedAt: a.markedAt ? a.markedAt.toISOString() : undefined,
      })),
      attendanceLockedAt: d.attendanceLockedAt ? d.attendanceLockedAt.toISOString() : undefined,
      mom: d.mom ? {
        content: d.mom.content,
        writtenBy: d.mom.writtenBy,
        updatedAt: d.mom.updatedAt ? d.mom.updatedAt.toISOString() : undefined,
      } : undefined,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  async getAllMeetings(): Promise<Meeting[]> {
    const docs = await MeetingModel.find().sort({ date: 1, time: 1 }).lean();
    return docs.map((d: any) => this.formatMeetingDoc(d));
  }

  async getMeetingById(id: string): Promise<Meeting> {
    const doc = await MeetingModel.findById(id).lean();
    if (!doc) {
      throw new NotFoundError(`Meeting with id ${id} not found`);
    }
    return this.formatMeetingDoc(doc);
  }

  async createMeeting(dto: CreateMeetingDto): Promise<Meeting> {
    const created: any = await MeetingModel.create({
      title: dto.title,
      agenda: dto.agenda || '',
      date: dto.date,
      time: dto.time,
      mode: dto.mode || (dto.meetLink ? 'ONLINE' : 'OFFLINE'),
      meetLink: dto.meetLink || '',
      location: dto.location || '',
      host: dto.host,
      attendeesCount: dto.attendeesCount || 5,
      status: 'UPCOMING',
      assignedInCharge: dto.assignedInCharge,
      attendance: [],
      mom: { content: '', writtenBy: '' },
    });

    return this.formatMeetingDoc(created);
  }

  async deleteMeeting(id: string): Promise<void> {
    const deleted = await MeetingModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Meeting with id ${id} not found`);
    }
  }

  async updateAttendance(
    id: string,
    attendanceList: AttendanceRecord[],
    user: { id: string; name: string; role: string }
  ): Promise<Meeting> {
    const meeting: any = await MeetingModel.findById(id);
    if (!meeting) {
      throw new NotFoundError(`Meeting with id ${id} not found`);
    }

    // 1. Authorization check
    const isLeadership = user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR';
    const isAssigned =
      meeting.assignedInCharge &&
      (meeting.assignedInCharge.id === user.id ||
        (meeting.assignedInCharge.name && meeting.assignedInCharge.name.toLowerCase().includes(user.name.toLowerCase())));

    if (!isLeadership && !isAssigned) {
      throw new ForbiddenError('Only the assigned in-charge member or Chapter Leadership can mark attendance.');
    }

    // 2. Check 2-hour lock window from meeting start/date
    try {
      if (meeting.date) {
        // Build estimated meeting timestamp
        const timePart = meeting.time || '18:00';
        const rawDateStr = `${meeting.date} ${timePart.split(' ')[0]}`;
        const meetingDate = new Date(rawDateStr);

        if (!isNaN(meetingDate.getTime())) {
          const now = Date.now();
          const twoHoursInMs = 2 * 60 * 60 * 1000;
          // If the meeting was more than 2 hours ago
          if (now > meetingDate.getTime() + twoHoursInMs && !isLeadership) {
            throw new ForbiddenError('Attendance editing window is locked (2 hours after scheduled meeting).');
          }
        }
      }
    } catch (err: any) {
      if (err instanceof ForbiddenError) throw err;
    }

    meeting.attendance = attendanceList.map((a) => ({
      memberId: a.memberId,
      memberName: a.memberName,
      domain: a.domain || '',
      isPresent: Boolean(a.isPresent),
      markedAt: new Date(),
    }));

    await meeting.save();
    return this.formatMeetingDoc(meeting);
  }

  async updateMoM(
    id: string,
    content: string,
    user: { id: string; name: string; role: string }
  ): Promise<Meeting> {
    const meeting: any = await MeetingModel.findById(id);
    if (!meeting) {
      throw new NotFoundError(`Meeting with id ${id} not found`);
    }

    // 1. Authorization check
    const isLeadership = user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR';
    const isAssigned =
      meeting.assignedInCharge &&
      (meeting.assignedInCharge.id === user.id ||
        (meeting.assignedInCharge.name && meeting.assignedInCharge.name.toLowerCase().includes(user.name.toLowerCase())));

    if (!isLeadership && !isAssigned) {
      throw new ForbiddenError('Only the assigned in-charge member or Chapter Leadership can edit Minutes of Meeting (MoM).');
    }

    meeting.mom = {
      content,
      writtenBy: user.name,
      updatedAt: new Date(),
    };

    await meeting.save();
    return this.formatMeetingDoc(meeting);
  }
}
