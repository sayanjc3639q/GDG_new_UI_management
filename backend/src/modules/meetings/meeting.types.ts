export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  domain?: string;
  isPresent: boolean;
  markedAt?: string;
}

export interface MeetingMoM {
  content: string;
  writtenBy?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  mode: 'ONLINE' | 'OFFLINE';
  meetLink?: string;
  location?: string;
  attendeesCount: number;
  host: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED';
  assignedInCharge?: {
    id: string;
    name: string;
    email?: string;
  };
  attendance?: AttendanceRecord[];
  attendanceLockedAt?: string;
  mom?: MeetingMoM;
  createdAt: string;
}

export interface CreateMeetingDto {
  title: string;
  agenda?: string;
  date: string;
  time: string;
  mode?: 'ONLINE' | 'OFFLINE';
  meetLink?: string;
  location?: string;
  host: string;
  attendeesCount?: number;
  assignedInCharge?: {
    id: string;
    name: string;
    email?: string;
  };
}
