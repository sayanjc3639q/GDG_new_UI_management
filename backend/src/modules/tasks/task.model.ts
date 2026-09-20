import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus } from './task.types';

export interface ITaskDocument extends Document {
  title: string;
  description: string;
  assignee: string;
  assignedBy?: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: TaskStatus;
  dueDate: string;
  submissionLink?: string;
  submissionNotes?: string;
  submittedAt?: Date;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  acceptedBy?: string;
  acceptedAt?: Date;
  markedDoneBy?: string;
  markedDoneAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignee: { type: String, required: true },
    assignedBy: { type: String, default: 'Lead Admin' },
    domain: { type: String, default: 'Web Developer' },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'ACCEPTED', 'COMPLETED'],
      default: 'TODO',
    },
    dueDate: { type: String, required: true },
    submissionLink: { type: String },
    submissionNotes: { type: String },
    submittedAt: { type: Date },
    reviewComment: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    acceptedBy: { type: String },
    acceptedAt: { type: Date },
    markedDoneBy: { type: String },
    markedDoneAt: { type: Date },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);
