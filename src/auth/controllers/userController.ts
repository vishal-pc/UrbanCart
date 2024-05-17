import { Request, Response } from "express";
import * as userService from "../services/userServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Forget password
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const result = await userService.forgetPassword(email);
    res.json(result);
  } catch (error) {
    console.error("Error in forget user password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    const result = await userService.resetPassword(
      email,
      otp,
      newPassword,
      confirmPassword,
      req
    );
    res.json(result);
  } catch (error) {
    console.error("Error in reset user password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Change password for user and admin
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const result = await userService.changePassword(
      req,
      oldPassword,
      newPassword,
      confirmPassword
    );
    res.json(result);
  } catch (error) {
    console.error("Error in change user password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const result = await userService.getCategories();
    res.json(result);
  } catch (error) {
    console.error("Error in get categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get categories by id with sub categories
export const getCategoriesByIdWithSubCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categoryId = req.params.categoryId;
    const result = await userService.getCategoriesByIdWithSubCategories(
      categoryId
    );
    res.json(result);
  } catch (error) {
    console.error("Error in get categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get subcategories by id with products
export const getSubCategoriesByIdWithProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const subcategoryId = req.params.subcategoryId;
    const result = await userService.getSubCategoriesByIdWithProducts(
      subcategoryId
    );
    res.json(result);
  } catch (error) {
    console.error("Error in get subcategories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
