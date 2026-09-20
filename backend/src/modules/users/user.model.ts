import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserDomain, LeadTitle, AuthProvider } from './users.types';

export interface IUserDocument extends Document {
  gdgId?: string;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  authProvider: AuthProvider;
  role: UserRole;
  domain?: UserDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    gdgId: { type: String, trim: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, sparse: true, index: true },
    authProvider: {
      type: String,
      enum: ['google', 'local', 'both'],
      default: 'local',
    },
    role: {
      type: String,
      enum: ['MEMBER', 'DOMAIN_SENIOR', 'LEAD', 'NON_MEMBER'],
      default: 'MEMBER',
    },
    domain: {
      type: String,
      enum: [
        'Graphic Designer',
        'Video Editor',
        'Photographer',
        'Web Developer',
        'Content Writer',
        'Public Relation Manager',
        'App Developer',
        'Technical Member',
      ],
    },
    leadTitle: {
      type: String,
      enum: ['Organizer', 'Co-Organizer', 'Secretary', 'Treasurer', 'Domain Lead'],
    },
    avatarUrl: { type: String },
    bio: { type: String, trim: true },
    github: { type: String },
    linkedin: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

