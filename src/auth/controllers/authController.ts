import { Request, Response } from "express";
import * as authService from "../services/authServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

export const authRegister = async (req: Request, res: Response) => {
  try {
    const result = await authService.authRegister(req.body);
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

export const authLogin = async (req: Request, res: Response) => {
  try {
    const result = await authService.authLogin(req.body);
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

// Get auth user By id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const result = await authService.getUserById(req);
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
