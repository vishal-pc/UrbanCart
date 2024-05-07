import mongoose, { Document, Schema } from "mongoose";

export interface ISubcategory extends Document {
  subCategory: Array<{
    _id: any;
    subCategoryName: string;
    subCategoryDescription: string;
  }>;
  createdBy: string;
  categorieId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new mongoose.Schema(
  {
    subCategory: [
      {
        subCategoryName: {
          type: String,
        },
        subCategoryDescription: {
          type: String,
        },
      },
    ],
    categorieId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    createdBy: {
      type: String,
    },
  },

  { timestamps: true }
);

const SubCategory = mongoose.model<ISubcategory>(
  "SubCategory",
  subCategorySchema
);
export default SubCategory;
