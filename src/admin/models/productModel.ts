import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: any;
  categoryId: Schema.Types.ObjectId;
  subCategoryId: Schema.Types.ObjectId;
  productName: string;
  productBrand: string;
  productPrice: number;
  productImg?: string[];
  productShortDescription: string;
  productDescription: string;
  productFeature: string;
  productStockQuantity: number;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
    },
    productName: {
      type: String,
    },
    productBrand: {
      type: String,
    },
    productPrice: {
      type: Number,
    },
    productImg: [{ type: String, required: false }],
    productShortDescription: {
      type: String,
    },
    productDescription: {
      type: String,
    },
    productStockQuantity: {
      type: Number,
    },
    productFeature: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
