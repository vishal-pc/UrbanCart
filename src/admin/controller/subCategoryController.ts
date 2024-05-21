import { Request, Response } from "express";
import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import Category, { ICategories } from "../models/categoriesModel";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";
import SubCategory, { ISubcategory } from "../models/subCategoriesModels";
import Auth from "../../auth/models/authModel";
import cloudinary from "../../middleware/cloudflare/cloudinary";

// Create a new category
export const createSubCategory = async (req: CustomRequest, res: Response) => {
  const { subCategoryName, subCategoryDescription, categoryName } = req.body;
  const file = req.file;
  try {
    const requiredFields = [
      "subCategoryName",
      "subCategoryDescription",
      "categoryName",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const existingSubCategory = await SubCategory.findOne({ subCategoryName });
    if (existingSubCategory) {
      return res.json({
        message: ErrorMessages.SubcategoriesExists,
        success: false,
        status: StatusCodes.ClientError.Conflict,
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
    const userId = user.userId;
    const foundUser = await Auth.findById({ _id: userId });

    const foundCategory: ICategories | null = await Category.findOne({
      categoryName: categoryName,
    });
    if (!foundCategory) {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
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

    const newsubcategories: ISubcategory = new SubCategory({
      subCategoryName,
      subCategoryDescription,
      subCategoryImg: secure_url,
      categoryId: foundCategory._id,
      createdBy: foundUser,
    });
    const savedSubCategory: ISubcategory = await newsubcategories.save();
    return res.json({
      status: StatusCodes.Success.Created,
      message: SuccessMessages.SubCategoriesSuccess,
      success: true,
      data: {
        _id: savedSubCategory._id,
        subCategoryName: savedSubCategory.subCategoryName,
        subCategoryDescription: savedSubCategory.subCategoryDescription,
        subCategoryImg: savedSubCategory.subCategoryImg,
        categoryId: {
          _id: foundCategory?._id,
          categoryName: foundCategory?.categoryName,
          categoryDescription: foundCategory?.categoryDescription,
          createdBy: {
            _id: foundUser?._id,
            fullname: foundUser?.fullName,
            IsAdmin: foundUser?.IsAdmin,
          },
        },
        createdBy: {
          _id: foundUser?._id,
          fullname: foundUser?.fullName,
          IsAdmin: foundUser?.IsAdmin,
        },
        createdAt: savedSubCategory.createdAt,
        updatedAt: savedSubCategory.updatedAt,
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

// Get all subcategories
export const getAllSubcategories = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const subcategories: ISubcategory[] = await SubCategory.find();
    return res.json({
      status: StatusCodes.Success.Ok,
      message: SuccessMessages.SubCategoriesFoundSuccess,
      success: true,
      data: subcategories.map((subcategory) => ({
        _id: subcategory._id,
        subCategoryName: subcategory.subCategoryName,
        subCategoryDescription: subcategory.subCategoryDescription,
        subCategoryImg: subcategory.subCategoryImg,
        categoryId: subcategory.categoryId,
        createdBy: subcategory.createdBy,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      })),
    });
  } catch (error) {
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get subcategories by ID
export const getSubcategoriesById = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { subCategoryId } = req.params;
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const subcategory: ISubcategory | null = await SubCategory.findById({
      _id: subCategoryId,
    });
    if (!subcategory) {
      return res.json({
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    return res.json({
      status: StatusCodes.Success.Ok,
      message: SuccessMessages.SubCategoriesFoundSuccess,
      success: true,
      data: {
        _id: subcategory._id,
        subCategoryName: subcategory.subCategoryName,
        subCategoryDescription: subcategory.subCategoryDescription,
        subCategoryImg: subcategory.subCategoryImg,
        categoryId: subcategory.categoryId,
        createdBy: subcategory.createdBy,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
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

// Update a product by ID
export const updateSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const { subCategoryName, subCategoryDescription } = req.body;
    const file = req.file;
    const subCategory = await SubCategory.findById(subCategoryId);

    if (!subCategory) {
      return res.json({
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    if (file) {
      const tempPath = file.path;
      const uploadResult = await cloudinary.uploader.upload(tempPath);
      const secure_url = uploadResult.secure_url;
      subCategory.subCategoryImg = secure_url;
    }

    if (subCategoryName) subCategory.subCategoryName = subCategoryName;
    if (subCategoryDescription)
      subCategory.subCategoryDescription = subCategoryDescription;

    const updatedSubCategory = await subCategory.save();

    return res.json({
      message: SuccessMessages.SubCategoriesUpdate,
      success: true,
      status: StatusCodes.Success.Ok,
      data: updatedSubCategory,
    });
  } catch (error) {
    console.error("Error in updating subcategory", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Delete a product by ID
export const deleteSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { subCategoryId } = req.params;
    const subCategory = await SubCategory.findById(subCategoryId);

    if (!subCategory) {
      return res.json({
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    await subCategory.deleteOne();

    return res.json({
      message: SuccessMessages.SubCategoriesDelete,
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
