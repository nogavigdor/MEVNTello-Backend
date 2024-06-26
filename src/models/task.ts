import { Schema, model } from "mongoose";
import { TaskDocument } from "../interfaces/ITask";
import { Types } from "mongoose";
import ISubTask from "../interfaces/ISubTask";

const subTaskSchema = new Schema<ISubTask>({
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    name: { type: String, required: true },
    completed: { type: Boolean, required: true, default: false },
});

export const taskSchema = new Schema<TaskDocument>(
    {
        listId: {
        type: Schema.Types.ObjectId,
        ref: "List",
        required: true,
        },
        name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
        },
        description: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
        },
        assignedMembers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        ],
        hoursAllocated: {
        type: Number,
        required: true,
        min: 0,
        },
        hoursUsed: {
        type: Number,
        required: true,
        min: 0,
        },
        status: {
        type: String,
        enum: ["todo", "inProgress", "done"],
        required: true,
        },
        subTasks: [subTaskSchema],
    }
,{
        timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
    }
);

export default model<TaskDocument>("Task", taskSchema);