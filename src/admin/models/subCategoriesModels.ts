import mongoose, { Document, Schema } from "mongoose";

export interface ISubcategory extends Document {
  _id: any;
  subCategoryName: string;
  subCategoryDescription: string;
  createdBy: Schema.Types.ObjectId;
  categoryId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new mongoose.Schema(
  {
    subCategoryName: {
      type: String,
    },
    subCategoryDescription: {
      type: String,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: false,
    },
  },

  { timestamps: true }
);

const SubCategory = mongoose.model<ISubcategory>(
  "SubCategory",
  subCategorySchema
);
export default SubCategory;
