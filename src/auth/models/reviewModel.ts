import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  _id: any;
  productId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  productImg?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    productImg: [{ type: String, required: false }],
    productShortDescription: {
      type: String,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
