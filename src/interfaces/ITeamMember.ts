import { Types } from 'mongoose';

//Team Memeber Interface
export interface TeamMember {
    userId: Types.ObjectId;
    role: 'leader' | 'member';
}

