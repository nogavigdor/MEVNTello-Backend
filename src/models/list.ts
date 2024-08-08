import { Schema, model } from 'mongoose';
import { ListDocument } from '../interfaces/IList';

const listSchema = new Schema<ListDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
  },
  {
    timestamps: true, // This correctly adds `createdAt` and `updatedAt` fields
  }
);

export default model<ListDocument>('List', listSchema);
