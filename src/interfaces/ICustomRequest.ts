import { Request } from 'express';
import { UserPayload } from './IUserPayload';

export interface CustomRequest extends Request {
    user: UserPayload;
}