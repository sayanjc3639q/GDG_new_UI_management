export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  meetLink: string;
  attendeesCount: number;
  host: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED';
  createdAt: string;
}

export interface CreateMeetingDto {
  title: string;
  agenda?: string;
  date: string;
  time: string;
  meetLink: string;
  host: string;
  attendeesCount?: number;
}
