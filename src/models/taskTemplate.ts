// src/models/taskTemplate.ts
import { Schema, model } from 'mongoose';
import { TaskTemplateDocument } from '../interfaces/ITaskTemplate';


// Task Template schema to enable creating auto task templates for projects
const taskTemplateSchema = new Schema<TaskTemplateDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
    },
    lists: [
      {
        name: {
          type: String,
          required: true,
        },
        tasks: [
          {
            name: {
              type: String,
              required: true,
            },
            description: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields
  }
);

export default model<TaskTemplateDocument>('TaskTemplate', taskTemplateSchema);
