import mongoose, { Document } from "mongoose";

export interface ICategories extends Document {
  categoryName: string;
  categoryDescription: string;
  createdBy: string;
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
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategories>("Category", categorySchema);
export default Category;
