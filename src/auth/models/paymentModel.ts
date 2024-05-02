import mongoose, { Document } from "mongoose";

export interface IPayment extends Document {
  buyerUserId: string;
  totalProduct: Array<{
    productId: mongoose.Types.ObjectId;
    cartId: mongoose.Types.ObjectId;
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
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        cartId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cart",
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
