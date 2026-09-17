import { apiClient } from '@/shared/lib/api-client';
import { GDGEvent, CreateEventDto } from './events.types';

export class EventsService {
  static async getEvents(): Promise<GDGEvent[]> {
    try {
      const response = await apiClient.get<GDGEvent[]>('/events');
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('[EventsService] Failed to load events from backend:', error);
    }
    return [];
  }

  static async createEvent(dto: CreateEventDto): Promise<GDGEvent> {
    const response = await apiClient.post<GDGEvent>('/events', dto);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create event');
  }
}
