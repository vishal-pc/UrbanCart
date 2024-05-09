import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  buyerUserId: Schema.Types.ObjectId;
  totalProduct: Array<{
    _id: any;
    productId: Schema.Types.ObjectId;
    productName: string;
    productPrice: number;
    productQuentity: number;
    productDescription: string;
    cartId: string;
  }>;
  totalCartAmount: number;
  paymentStatus: "Pending" | "Completed";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    totalProduct: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: false,
        },
        productName: {
          type: String,
        },
        productPrice: {
          type: Number,
        },
        productQuentity: {
          type: Number,
        },
        productDescription: {
          type: String,
        },
        cartId: {
          type: String,
        },
      },
    ],
    totalCartAmount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
