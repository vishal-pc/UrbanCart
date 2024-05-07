import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import Category, { ICategories } from "../models/categoriesModel";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";

// Create a new category
export const createCategory = async (categoryData: any, req: CustomRequest) => {
  const { categoryName, categoryDescription } = categoryData;
  try {
    const requiredFields = ["categoryName", "categoryDescription"];
    const missingFields = requiredFields.filter(
      (field) => !categoryData[field]
    );

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;

    const newCategory: ICategories = new Category({
      categoryName,
      categoryDescription,
      createdBy: userId,
    });
    const savedCategory: ICategories = await newCategory.save();
    return {
      status: StatusCodes.Success.Created,
      message: SuccessMessages.CategoriesSuccess,
      success: true,
      data: savedCategory,
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all categories
export const getAllCategories = async (req: CustomRequest) => {
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
    const categories = await Category.find({ createdBy: userId });
    if (categories.length > 0) {
      return {
        status: StatusCodes.Success.Ok,
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        data: categories,
      };
    }
    return {
      message: ErrorMessages.CategoriesNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get category by id
export const getCategoryById = async (
  categoryId: string,
  req: CustomRequest
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

    const category = await Category.findOne({
      createdBy: userId,
      _id: categoryId,
    });
    if (category) {
      return {
        status: StatusCodes.Success.Ok,
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        data: category,
      };
    }
    return {
      message: ErrorMessages.CategoriesNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
