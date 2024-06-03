import { Document, Types } from 'mongoose';
import { TeamMember } from './ITeamMember';

export interface ITask {
    listId: Types.ObjectId;
    name: string;
    description: string;
    assignedMembers: TeamMember[]; // Array of User IDs
    hoursAllocated: number;
    hoursUsed: number;
    status: 'todo' | 'inProgress' | 'done';
    subTasks: { name:String; completed: boolean }[]; // Array of subtasks
    createdAt?: Date;
    updatedAt?: Date;
} 

export interface TaskDocument extends ITask, Document {}