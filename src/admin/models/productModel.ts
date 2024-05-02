import mongoose, { Document } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  productImg: string;
  productDescription: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
    },
    productPrice: {
      type: Number,
    },
    productImg: {
      type: String,
    },
    productDescription: {
      type: String,
    },
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
