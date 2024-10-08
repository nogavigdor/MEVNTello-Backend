import { Schema, model } from "mongoose";
import { UserDocument } from "../interfaces/IUser";


const userSchema = new Schema<UserDocument>(
  {
    
      username: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255
      },
      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
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
      }
    },
    {
      timestamps: true
    }
    );
    
   
export default model<UserDocument>("User", userSchema);
