import mongoose, { Document } from "mongoose";

export interface IAuth extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const authSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

const Auth = mongoose.model<IAuth>("Auth", authSchema);
export default Auth;
