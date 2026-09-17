import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/app-error';
import { CheckInDto, CreateRsvpDto, Rsvp } from './rsvp.types';

export class RsvpService {
  private rsvps: Rsvp[] = [];

  async getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
    return this.rsvps.filter((r) => r.eventId === eventId);
  }

  async createRsvp(dto: CreateRsvpDto): Promise<Rsvp> {
    const existing = this.rsvps.find(
      (r) => r.eventId === dto.eventId && r.userId === dto.userId && r.status !== 'CANCELLED'
    );

    if (existing) {
      throw new ConflictError('User is already registered for this event');
    }

    const newRsvp: Rsvp = {
      id: `rsvp_${Date.now()}`,
      eventId: dto.eventId,
      userId: dto.userId,
      userName: dto.userName,
      userEmail: dto.userEmail,
      status: 'CONFIRMED',
      ticketCode: `GDG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    this.rsvps.push(newRsvp);
    return newRsvp;
  }

  async checkIn(dto: CheckInDto): Promise<Rsvp> {
    const rsvp = this.rsvps.find((r) => r.ticketCode === dto.ticketCode);
    if (!rsvp) {
      throw new NotFoundError('Invalid ticket code');
    }

    if (rsvp.status === 'ATTENDED') {
      throw new BadRequestError('Ticket has already been checked in');
    }

    rsvp.status = 'ATTENDED';
    rsvp.checkedInAt = new Date().toISOString();
    return rsvp;
  }

  async cancelRsvp(id: string): Promise<Rsvp> {
    const rsvp = this.rsvps.find((r) => r.id === id);
    if (!rsvp) {
      throw new NotFoundError('RSVP not found');
    }

    rsvp.status = 'CANCELLED';
    return rsvp;
  }
}
