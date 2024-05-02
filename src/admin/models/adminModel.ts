import mongoose, { Document } from "mongoose";

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  type: string;
  IsAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new mongoose.Schema(
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
    type: {
      type: String,
    },
    IsAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin;
