import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const result = await categoryService.createCategory(
      req.body,
      req,
      file as Express.Multer.File
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in creating categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategories(req);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get category by id
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.getCategoryById(
      req.params.categoryId,
      req
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting category by id", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Update a category by ID
export const updateCategoryById = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const result = await categoryService.updateCategoryById(
      req.params.categoryId,
      req.body,
      file as Express.Multer.File
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in updating category", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Delete a category by ID
export const deleteCategoryById = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.deleteCategoryById(
      req.params.categoryId
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in deleting category", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
