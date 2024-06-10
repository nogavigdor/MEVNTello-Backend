import { Schema, model } from "mongoose";
import { ProjectDocument } from "../interfaces/IProject";

const projectSchema = new Schema<ProjectDocument>(
  {
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    allocatedHours: {
      type: Number,
      required: true,
      min: 0,
    },
    teamMembers: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['leader', 'member'],
                    required: true,
                },
            },
        ],
  },
  {
    timestamps: true,
  }
);

export default model<ProjectDocument>("Project", projectSchema);