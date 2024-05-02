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
      message: ErrorMessages.ForgotPasswordError,
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
      confirmPassword
    );
    res.json(result);
  } catch (error) {
    console.error("Error in reset user password", error);
    return {
      message: ErrorMessages.ResetPasswordsError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
