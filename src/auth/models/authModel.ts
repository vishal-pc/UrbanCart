import mongoose, { Schema, Document } from "mongoose";

export interface IAuth extends Document {
  fullName: string;
  email: string;
  password: string;
  IsAdmin: boolean;
  role: Schema.Types.ObjectId;
  mobileNumber: number;
  state: string;
  streetAddress: string;
  nearByAddress: string;
  areaPincode: number;
  city: string;
  stripeUserId: string;
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
    role: { type: Schema.Types.ObjectId, ref: "Role", required: false },
    IsAdmin: {
      type: Boolean,
      default: false,
    },
    mobileNumber: { type: Number },
    state: { type: String },
    streetAddress: { type: String },
    nearByAddress: { type: String },
    areaPincode: { type: Number },
    city: { type: String },
    stripeUserId: { type: String },
  },
  { timestamps: true }
);

const Auth = mongoose.model<IAuth>("Auth", authSchema);
export default Auth;
