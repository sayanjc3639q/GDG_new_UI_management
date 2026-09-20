import mongoose, { Schema, Document } from 'mongoose';
import { LeaveStatus, LeaveType } from './leave.types';

export interface ILeaveDocument extends Document {
  applicantName: string;
  applicantRole: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  handoverPerson: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeaveDocument>(
  {
    applicantName: { type: String, required: true },
    applicantRole: { type: String, required: true },
    leaveType: {
      type: String,
      enum: ['EXAM_PREPARATION', 'MEDICAL', 'PERSONAL', 'ACADEMIC_PROJECT'],
      default: 'PERSONAL',
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    handoverPerson: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const LeaveModel = mongoose.models.Leave || mongoose.model<ILeaveDocument>('Leave', LeaveSchema);
