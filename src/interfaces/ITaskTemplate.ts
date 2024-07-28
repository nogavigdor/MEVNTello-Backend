// src/interfaces/ITaskTemplate.ts
import { Document, Types } from 'mongoose';

// Task Template interface to enable creating auto task templates for projects
export interface ITaskTemplate {
  _id: Types.ObjectId;
  name: string;
  lists: {
    name: string;
    tasks: {
      name: string;
      description: string;
    }[];
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskTemplateDocument extends ITaskTemplate, Document {
  _id: Types.ObjectId;
}
