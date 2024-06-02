import { Document } from 'mongoose';

// User interface
export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}
export interface UserDocument extends IUser, Document {}
