export type EventType = 'WORKSHOP' | 'HACKATHON' | 'TECH_TALK' | 'STUDY_JAM' | 'DEV_FEST';
export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface GDGEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  bannerUrl?: string;
  startDate: string;
  endDate?: string;
  location: string;
  isVirtual?: boolean;
  meetingLink?: string;
  capacity: number;
  tags?: string[];
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location: string;
  isVirtual?: boolean;
  meetingLink?: string;
  capacity: number;
  tags?: string[];
}
