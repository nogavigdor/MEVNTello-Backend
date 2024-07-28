import { Document, Types } from 'mongoose';

import { TeamMember } from './ITeamMember';

// Project interface
export interface IProject {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  creator: Types.ObjectId; // User ID of the creator
  teamMembers: TeamMember[]; // Array of objects of User IDs with roles
  lists?: Types.ObjectId[]; // Optional array of List IDs
  createdAt?: Date; 
  updatedAt?: Date;
}

export interface ProjectDocument extends IProject, Document {
  _id: Types.ObjectId;
}