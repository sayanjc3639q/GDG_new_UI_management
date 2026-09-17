export type RsvpStatus = 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | 'ATTENDED';

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: RsvpStatus;
  ticketCode: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface CreateRsvpDto {
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface CheckInDto {
  ticketCode: string;
}
