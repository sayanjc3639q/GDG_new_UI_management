import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDocument extends Document {
  title: string;
  description: string;
  assignee: string;
  domain: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignee: { type: String, required: true },
    domain: { type: String, default: 'General' },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], default: 'TODO' },
    dueDate: { type: String, required: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);
