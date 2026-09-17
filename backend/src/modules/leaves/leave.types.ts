export type LeaveType = 'EXAM_PREPARATION' | 'MEDICAL' | 'PERSONAL' | 'ACADEMIC_PROJECT';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveApplication {
  id: string;
  applicantName: string;
  applicantRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverPerson: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface CreateLeaveDto {
  applicantName: string;
  applicantRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverPerson: string;
}
