import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  buyerUserId: {
    type: String,
    require: false,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false,
      },
      quantity: {
        type: Number,
        required: false,
      },
    },
  ],
  totalAmount: {
    type: Number,
    require: false,
  },
});
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
