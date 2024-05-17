import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  loggedInUserId: Schema.Types.ObjectId;
  mobileNumber: number;
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  nearByAddress: string;
  areaPincode: number;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new mongoose.Schema(
  {
    loggedInUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    mobileNumber: { type: Number },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    streetAddress: { type: String },
    nearByAddress: { type: String },
    areaPincode: { type: Number },
  },
  { timestamps: true }
);

const Address = mongoose.model<IAddress>("Address", addressSchema);
export default Address;
