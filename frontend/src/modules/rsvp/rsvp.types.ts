export type RsvpStatus = 'CONFIRMED' | 'WAITLIST' | 'CANCELLED' | 'ATTENDED';

export interface Rsvp {
  id: string;
  eventId: string;
  eventName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: RsvpStatus;
  ticketCode: string;
  checkedInAt?: string;
  createdAt: string;
}

export interface CheckInResult {
  rsvp: Rsvp;
  message: string;
}
