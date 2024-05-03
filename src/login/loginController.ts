import { Request, Response } from "express";
import * as loginService from "../login/loginService";
import { StatusCodes, ErrorMessages } from "../validation/responseMessages";

// user login
export const authLogin = async (req: Request, res: Response) => {
  try {
    const result = await loginService.authLogin(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in login", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
