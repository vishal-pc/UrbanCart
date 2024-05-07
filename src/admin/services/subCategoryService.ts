import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import Category, { ICategories } from "../models/categoriesModel";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";
import SubCategory, { ISubcategory } from "../models/subCategoriesModels";

// Create a new category
export const createSubCategory = async (
  req: CustomRequest,
  subCategory: {
    subCategoryName: string;
    subCategoryDescription: string;
  },
  categorieId: string
) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;

    const foundCategory: ICategories | null = await Category.findById(
      categorieId
    );
    if (!foundCategory) {
      return {
        message: ErrorMessages.CategoriesError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }

    const newsubcategories = new SubCategory({
      categorieId: foundCategory,
      createdBy: userId,
      subCategory: [
        {
          subCategoryName: subCategory.subCategoryName,
          subCategoryDescription: subCategory.subCategoryDescription,
        },
      ],
    });
    const savedPayment = await newsubcategories.save();
    return {
      status: StatusCodes.Success.Created,
      message: SuccessMessages.SubCategoriesSuccess,
      success: true,
      data: savedPayment,
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
