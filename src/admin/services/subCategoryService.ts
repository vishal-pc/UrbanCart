import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import Category, { ICategories } from "../models/categoriesModel";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";
import SubCategory, { ISubcategory } from "../models/subCategoriesModels";
import Auth from "../../auth/models/authModel";

// Create a new category
export const createSubCategory = async (
  subCategoryData: any,
  req: CustomRequest
) => {
  const { subCategoryName, subCategoryDescription, categoryName } =
    subCategoryData;
  try {
    const requiredFields = [
      "subCategoryName",
      "subCategoryDescription",
      "categoryName",
    ];
    const missingFields = requiredFields.filter(
      (field) => !subCategoryData[field]
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
    const foundUser = await Auth.findById({ _id: userId });

    const foundCategory: ICategories | null = await Category.findOne({
      categoryName: categoryName,
    });
    if (!foundCategory) {
      return {
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }

    const newsubcategories: ISubcategory = new SubCategory({
      subCategoryName,
      subCategoryDescription,
      categorieId: foundCategory._id,
      createdBy: foundUser,
    });
    const savedSubCategory: ISubcategory = await newsubcategories.save();
    return {
      status: StatusCodes.Success.Created,
      message: SuccessMessages.SubCategoriesSuccess,
      success: true,
      data: {
        _id: savedSubCategory._id,
        subCategoryName: savedSubCategory.subCategoryName,
        subCategoryDescription: savedSubCategory.subCategoryDescription,
        categorieId: {
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
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all subcategories
export const getAllSubcategories = async (req: CustomRequest) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const subcategories: ISubcategory[] = await SubCategory.find();
    return {
      status: StatusCodes.Success.Ok,
      message: SuccessMessages.SubCategoriesFoundSuccess,
      success: true,
      data: subcategories.map((subcategory) => ({
        _id: subcategory._id,
        subCategoryName: subcategory.subCategoryName,
        subCategoryDescription: subcategory.subCategoryDescription,
        categorieId: subcategory.categorieId,
        createdBy: subcategory.createdBy,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      })),
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get subcategories by ID
export const getSubcategoriesById = async (
  req: CustomRequest,
  subCategoryId: string
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
    const subcategory: ISubcategory | null = await SubCategory.findById({
      _id: subCategoryId,
    });
    if (!subcategory) {
      return {
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    return {
      status: StatusCodes.Success.Ok,
      message: SuccessMessages.SubCategoriesFoundSuccess,
      success: true,
      data: {
        _id: subcategory._id,
        subCategoryName: subcategory.subCategoryName,
        subCategoryDescription: subcategory.subCategoryDescription,
        categorieId: subcategory.categorieId,
        createdBy: subcategory.createdBy,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt,
      },
    };
  } catch (error) {
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
