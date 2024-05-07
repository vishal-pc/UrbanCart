import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.createCategory(req.body, req);
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
