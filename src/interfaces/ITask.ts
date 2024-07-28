import { Document, Types } from 'mongoose';
import { TeamMember } from './ITeamMember';
import ISubTask from './ISubTask';


    export interface ITask {
        _id: Types.ObjectId;
        listId: Types.ObjectId;
        name: string;
        description: string;
        assignedMembers: TeamMember[]; // Array of User IDs
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
