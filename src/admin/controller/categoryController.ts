import { Request, Response } from "express";

import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import Category, { ICategories } from "../models/categoriesModel";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";
import Auth from "../../auth/models/authModel";
import cloudinary from "../../middleware/cloudflare/cloudinary";

// Create a new category
export const createCategory = async (req: CustomRequest, res: Response) => {
  const { categoryName, categoryDescription } = req.body;
  const file = req.file;
  try {
    const requiredFields = ["categoryName", "categoryDescription"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.json({
        message: ErrorMessages.CategoriesExists,
        success: false,
        status: StatusCodes.ClientError.Conflict,
      });
    }
    const userId = user.userId;
    const foundUser = await Auth.findById({ _id: userId });

    if (!file) {
      return res.json({
        message: ErrorMessages.FileUploadError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const tempPath = file.path;
    const uploadResult = await cloudinary.uploader.upload(tempPath);
    const secure_url = uploadResult.secure_url;

    const newCategory: ICategories = new Category({
      categoryName,
      categoryDescription,
      categoryImg: secure_url,
      createdBy: foundUser,
    });
    const savedCategory: ICategories = await newCategory.save();
    return res.json({
      status: StatusCodes.Success.Created,
      message: SuccessMessages.CategoriesSuccess,
      success: true,
      data: {
        _id: savedCategory._id,
        categoryName: savedCategory.categoryName,
        categoryDescription: savedCategory.categoryDescription,
        categoryImg: savedCategory.categoryImg,
        createdBy: {
          _id: foundUser?._id,
          fullname: foundUser?.fullName,
          IsAdmin: foundUser?.IsAdmin,
        },
        createdAt: savedCategory.createdAt,
        updatedAt: savedCategory.updatedAt,
      },
    });
  } catch (error) {
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all categories
export const getAllCategories = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;
    const categories = await Category.find({ createdBy: userId });
    if (categories.length > 0) {
      return res.json({
        status: StatusCodes.Success.Ok,
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        data: categories,
      });
    }
    return res.json({
      message: ErrorMessages.CategoriesNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    });
  } catch (error) {
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get category by id
export const getCategoryById = async (req: CustomRequest, res: Response) => {
  try {
    const { categoryId } = req.params;
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;

    const category = await Category.findOne({
      createdBy: userId,
      _id: categoryId,
    });
    if (category) {
      return res.json({
        status: StatusCodes.Success.Ok,
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        data: category,
      });
    }
    return res.json({
      message: ErrorMessages.CategoriesNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    });
  } catch (error) {
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Update a product by ID
export const updateCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, categoryDescription } = req.body;
    const file = req.file;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    if (file) {
      const tempPath = file.path;
      const uploadResult = await cloudinary.uploader.upload(tempPath);
      const secure_url = uploadResult.secure_url;
      category.categoryImg = secure_url;
    }

    if (categoryName) category.categoryName = categoryName;
    if (categoryDescription) category.categoryDescription = categoryDescription;

    const updatedcategory = await category.save();

    return res.json({
      message: SuccessMessages.CategoriesUpdate,
      success: true,
      status: StatusCodes.Success.Ok,
      data: updatedcategory,
    });
  } catch (error) {
    console.error("Error in updating category", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Delete a product by ID
export const deleteCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    await category.deleteOne();

    return res.json({
      message: SuccessMessages.CategoriesDelete,
      success: true,
      status: StatusCodes.Success.Ok,
    });
  } catch (error) {
    console.error("Error in deleting category", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
