import { Schema, model } from "mongoose";
import { UserDocument } from "../types/user.interface";
import Joi from "joi";

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      min: 6,
      max: 255,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model<UserDocument>("User", userSchema);
