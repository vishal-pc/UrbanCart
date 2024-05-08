import { Request, Response } from "express";
import * as authService from "../services/authServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// User register
export const authRegister = async (req: Request, res: Response) => {
  try {
    console.log("testing");
    const result = await authService.authRegister(req.body);
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
