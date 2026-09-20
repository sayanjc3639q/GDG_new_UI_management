import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceRecord {
  memberId: string;
  memberName: string;
  domain?: string;
  isPresent: boolean;
  markedAt?: Date;
}

export interface IMeetingMoM {
  content: string;
  writtenBy?: string;
  updatedAt?: Date;
}

export interface IMeetingDocument extends Document {
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
  attendance?: IAttendanceRecord[];
  attendanceLockedAt?: Date;
  mom?: IMeetingMoM;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceRecord>(
  {
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    domain: { type: String },
    isPresent: { type: Boolean, default: false },
    markedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MoMSchema = new Schema<IMeetingMoM>(
  {
    content: { type: String, default: '' },
    writtenBy: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MeetingSchema = new Schema<IMeetingDocument>(
  {
    title: { type: String, required: true },
    agenda: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'ONLINE' },
    meetLink: { type: String, default: '' },
    location: { type: String, default: '' },
    attendeesCount: { type: Number, default: 5 },
    host: { type: String, required: true },
    status: { type: String, enum: ['UPCOMING', 'LIVE_NOW', 'CONCLUDED'], default: 'UPCOMING' },
    assignedInCharge: {
      id: { type: String },
      name: { type: String },
      email: { type: String },
    },
    attendance: [AttendanceSchema],
    attendanceLockedAt: { type: Date },
    mom: MoMSchema,
  },
  { timestamps: true }
);

export const MeetingModel = mongoose.models.Meeting || mongoose.model<IMeetingDocument>('Meeting', MeetingSchema);
