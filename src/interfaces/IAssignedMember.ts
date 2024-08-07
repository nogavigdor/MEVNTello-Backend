import { Types } from 'mongoose';
import { TeamMember } from './ITeamMember';

//Assigned Member Interface extends Team Member

export interface AssignedMember extends TeamMember {
    allocatedHours: number;
    usedHours: number;
}