import { Types } from 'mongoose';

export default interface ISubTask {
    _id: Types.ObjectId;
    name: string;
    completed: boolean;
}
