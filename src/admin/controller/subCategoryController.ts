import { Request, Response } from "express";
import * as subCategoryService from "../services/subCategoryService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new category
export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const result = await subCategoryService.createSubCategory(
      req.body,
      req,
      file as Express.Multer.File
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in creating subcategories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all subcategories
export const getAllSubcategories = async (req: Request, res: Response) => {
  try {
    const result = await subCategoryService.getAllSubcategories(req);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting subcategories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get subcategories by ID
export const getSubcategoriesById = async (req: Request, res: Response) => {
  try {
    const result = await subCategoryService.getSubcategoriesById(
      req,
      req.params.subCategoryId
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting subcategories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Update a subcategory by ID
export const updateSubCategoryById = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    const result = await subCategoryService.updateSubCategoryById(
      req.params.subCategoryId,
      req.body,
      file as Express.Multer.File
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in updating subcategory", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Delete a subcategory by ID
export const deleteSubCategoryById = async (req: Request, res: Response) => {
  try {
    const result = await subCategoryService.deleteSubCategoryById(
      req.params.subCategoryId
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in deleting subcategory", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
