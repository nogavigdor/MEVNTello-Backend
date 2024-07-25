import { Types } from 'mongoose';

//Team Memeber Interface
export interface TeamMember {
    _id: Types.ObjectId;
    role: 'leader' | 'member';
}

