import { Document, Types } from 'mongoose';

// User interface
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  role: 'user' | 'admin';
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UserDocument extends IUser, Document { _id: Types.ObjectId; }
