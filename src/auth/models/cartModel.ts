import mongoose from "mongoose";

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
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
