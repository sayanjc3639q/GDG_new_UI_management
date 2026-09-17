import mongoose, { Schema, Document } from 'mongoose';
import { EventType, EventStatus } from './events.types';

export interface IEventDocument extends Document {
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  capacity: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['WORKSHOP', 'HACKATHON', 'TECH_TALK', 'STUDY_JAM', 'DEV_FEST'],
      default: 'WORKSHOP',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
    },
    bannerUrl: { type: String },
    startDate: { type: String, required: true },
    endDate: { type: String, default: '' },
    location: { type: String, required: true },
    isVirtual: { type: Boolean, default: false },
    meetingLink: { type: String },
    capacity: { type: Number, default: 100 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const EventModel = mongoose.models.Event || mongoose.model<IEventDocument>('Event', EventSchema);
