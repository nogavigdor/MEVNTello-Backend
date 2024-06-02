import { Document } from 'mongoose';

// Project interface
export interface IProject {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  teamMembers: string[]; // Array of User IDs
  lists: string[]; // Array of List IDs
  createdAt?: Date; 
}

export interface ProjectDocument extends IProject, Document {}