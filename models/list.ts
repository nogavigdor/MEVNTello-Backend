import { Schema, model } from "mongoose";
import { ListDocument } from "../interfaces/IList";

export const listSchema = new Schema<ListDocument>(
    {
        name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
        },
        projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        },
        tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Task",
        },
        ],
        createdAt: {
        type: Date,
        default: Date.now,
        },
        updatedAt: {
        type: Date,
        default: Date.now,
        },
    }
    );

export default model<ListDocument>("List", listSchema);