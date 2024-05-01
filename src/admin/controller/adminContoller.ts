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
      message: ErrorMessages.RegisterError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Admin login
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.loginAdmin(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in login", error);
    return {
      message: ErrorMessages.LoginError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get admin user By id
export const getAdminById = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.getAdminById(req);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting user by id", error);
    return {
      message: ErrorMessages.UserNotFound,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
