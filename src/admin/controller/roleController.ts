import { Request, Response } from "express";
import * as roleServices from "../services/roleService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Admin Register
export const createRole = async (req: Request, res: Response) => {
  try {
    const result = await roleServices.createRole(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in create role", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
