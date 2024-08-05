import { Schema, model } from "mongoose";
import { ProjectDocument } from "../interfaces/IProject";

const projectSchema = new Schema<ProjectDocument>(
  {
    creationStatus: {
      type: String,
      enum: ['tasks', 'management', 'complete'],
      required: true,
    },
    selectedTemplate: {
      type: Schema.Types.ObjectId,
      ref: 'TaskTemplate',
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
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
            {
                _id: {
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
        lists: [{ type: Schema.Types.ObjectId, ref: 'List' }], 
  },
  {
    timestamps: true,
  }
);

export default model<ProjectDocument>("Project", projectSchema);