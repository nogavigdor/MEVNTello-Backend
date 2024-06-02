import { Document } from 'mongoose';

// User interface
export interface IUser {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
}
export interface UserDocument extends IUser, Document {}
