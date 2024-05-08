import mongoose, { Document, Schema } from "mongoose";

export interface ICart extends Document {
  buyerUserId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new mongoose.Schema(
  {
    buyerUserId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
    },
  },
  { timestamps: true }
);
const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
