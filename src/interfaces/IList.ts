import { Document, Types } from 'mongoose';

// List interface
export interface IList {
  _id: Types.ObjectId;
  name: string;
  projectId: Types.ObjectId; // Reference to Proejct ID
  tasks: string[]; // Array of Task IDs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ListDocument extends IList, Document {_id: Types.ObjectId;}

