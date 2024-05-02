import mongoose, { Document } from "mongoose";

export interface ICart extends Document {
  buyerUserId: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new mongoose.Schema(
  {
    buyerUserId: {
      type: String,
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
