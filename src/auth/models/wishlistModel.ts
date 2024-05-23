import mongoose, { Document, Schema } from "mongoose";

export interface IWishList extends Document {
  _id: any;
  buyerUserId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishListSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);
const WishList = mongoose.model<IWishList>("WishList", wishListSchema);
export default WishList;
