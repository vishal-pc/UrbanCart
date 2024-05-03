import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  buyerUserId: string;
  totalProduct: Array<{
    _id: any;
    productId: string;
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
      type: String,
    },
    totalProduct: [
      {
        productId: {
          type: String,
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
