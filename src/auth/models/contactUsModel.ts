import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  reasonForContact: string;
  userName: string;
  userMobileNumber: number;
  userEmail: string;
  userComment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactUsSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    reasonForContact: {
      type: String,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    userMobileNumber: {
      type: Number,
    },
    userComment: {
      type: String,
    },
  },
  { timestamps: true }
);
const ContactUs = mongoose.model<IContact>("ContactUs", ContactUsSchema);
export default ContactUs;
