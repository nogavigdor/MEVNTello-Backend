import { Schema, model } from "mongoose";
import { UserDocument } from "../interfaces/IUser";


const userSchema = new Schema<UserDocument>(
  {
    
      username: {
        type: String,
        required: false,
        minlength: 6,
        maxlength: 255
      },
      email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 255
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
    );
    
   
export default model<UserDocument>("User", userSchema);
