import { Request, Response } from "express";
import * as adminServices from "../services/adminServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Admin Register
export const adminRegister = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.registerAdmin(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in register", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.getAllUsers();
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting users", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
