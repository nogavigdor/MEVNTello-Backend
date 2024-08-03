import { Schema, model } from 'mongoose';
import { TaskTemplateDocument } from '../interfaces/ITaskTemplate';

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
