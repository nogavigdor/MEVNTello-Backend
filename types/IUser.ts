import { Document, Types } from 'mongoose';

// User interface
export interface IUser {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UserDocument extends IUser, Document {}
