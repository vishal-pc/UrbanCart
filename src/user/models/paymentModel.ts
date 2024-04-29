import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
