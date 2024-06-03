import { Schema, model } from "mongoose";
import { TaskDocument } from "../interfaces/ITask";

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
        subTasks: [
        {
            name: String,
            completed: Boolean,
        },
        ], // Add a closing curly brace here
    }
,{
        timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
    }
);

export default model<TaskDocument>("Task", taskSchema);