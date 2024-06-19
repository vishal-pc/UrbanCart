import mongoose, { Schema, Document } from "mongoose";

export interface IAuth extends Document {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: number;
  profileImg: string;
  address: string;
  IsAdmin: boolean;
  role: Schema.Types.ObjectId;
  stripeUserId: string;
  userLogin: boolean;
  provider:string;
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
    mobileNumber: {
      type: Number,
    },
    profileImg: {
      type: String,
    },
    address: {
      type: String,
    },
    provider: {
      type: String,
    },
    userLogin: {
      type: Boolean,
      default: false,
    },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: false },
    IsAdmin: { type: Boolean },
    stripeUserId: { type: String },
  },
  { timestamps: true }
);

const Auth = mongoose.model<IAuth>("Auth", authSchema);
export default Auth;
