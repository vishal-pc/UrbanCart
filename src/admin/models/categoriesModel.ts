import mongoose, { Document, Schema } from "mongoose";

export interface ICategories extends Document {
  _id: any;
  categoryName: string;
  categoryDescription: string;
  categoryImg: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
    },
    categoryDescription: {
      type: String,
    },
    categoryImg: {
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

const Category = mongoose.model<ICategories>("Category", categorySchema);
export default Category;
