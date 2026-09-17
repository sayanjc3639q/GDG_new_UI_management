import mongoose, { Schema, Document } from 'mongoose';

export interface IMeetingDocument extends Document {
  title: string;
  agenda: string;
  date: string;
  time: string;
  meetLink: string;
  attendeesCount: number;
  host: string;
  status: 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeetingDocument>(
  {
    title: { type: String, required: true },
    agenda: { type: String, default: '' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    meetLink: { type: String, required: true },
    attendeesCount: { type: Number, default: 5 },
    host: { type: String, required: true },
    status: { type: String, enum: ['UPCOMING', 'LIVE_NOW', 'CONCLUDED'], default: 'UPCOMING' },
  },
  { timestamps: true }
);

export const MeetingModel = mongoose.models.Meeting || mongoose.model<IMeetingDocument>('Meeting', MeetingSchema);
