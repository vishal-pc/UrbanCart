import { Request, Response } from "express";
import * as subCategoryService from "../services/subCategoryService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new category
export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { subCategory, categorieId } = req.body;
    const result = await subCategoryService.createSubCategory(
      req,
      subCategory,
      categorieId
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
