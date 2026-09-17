import { apiClient } from '@/shared/lib/api-client';
import { Rsvp } from './rsvp.types';

const defaultMockRsvps: Rsvp[] = [
  {
    id: 'rsvp_1',
    eventId: 'evt_1',
    eventName: 'Google Cloud Study Jam 2026',
    userId: 'usr_101',
    userName: 'Tanmay Das',
    userEmail: 'tanmay@example.com',
    status: 'ATTENDED',
    ticketCode: 'GDG-CLD921',
    checkedInAt: '2026-09-17T09:30:00.000Z',
    createdAt: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 'rsvp_2',
    eventId: 'evt_1',
    eventName: 'Google Cloud Study Jam 2026',
    userId: 'usr_102',
    userName: 'Ritika Sen',
    userEmail: 'ritika@example.com',
    status: 'CONFIRMED',
    ticketCode: 'GDG-HIT843',
    createdAt: '2026-09-16T15:20:00.000Z',
  },
  {
    id: 'rsvp_3',
    eventId: 'evt_2',
    eventName: 'GDG Annual 36h Hackathon',
    userId: 'usr_103',
    userName: 'Arjun Mehta',
    userEmail: 'arjun@example.com',
    status: 'CONFIRMED',
    ticketCode: 'GDG-HCK512',
    createdAt: '2026-09-16T18:00:00.000Z',
  },
];

export class RsvpService {
  static async getRsvps(): Promise<Rsvp[]> {
    return defaultMockRsvps;
  }

  static async checkIn(ticketCode: string): Promise<Rsvp> {
    try {
      const response = await apiClient.post<Rsvp>('/rsvp/check-in', { ticketCode });
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // Fallback local check-in
    }

    const item = defaultMockRsvps.find((r) => r.ticketCode.toUpperCase() === ticketCode.toUpperCase());
    if (!item) {
      throw new Error(`Ticket code "${ticketCode}" was not found in the registry.`);
    }

    item.status = 'ATTENDED';
    item.checkedInAt = new Date().toISOString();
    return item;
  }
}
