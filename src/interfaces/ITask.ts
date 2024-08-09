import { Document, Types } from 'mongoose';
import { AssignedMember } from './IAssignedMember';
import ISubTask from './ISubTask';


    export interface ITask {
        _id: Types.ObjectId;
        listId: Types.ObjectId;
        name: string;
        description: string;
        assignedMembers: AssignedMember[]; 
        hoursAllocated: number;
        hoursUsed: number;
        status: 'todo' | 'inProgress' | 'done';
        subTasks: ISubTask[];
        createdAt?: Date;
        updatedAt?: Date;
    } 

export interface TaskDocument extends ITask, Document {
    _id: Types.ObjectId;
}
