import { Request, Response } from "express";
import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import { Role } from "../models/roleModel";

// create Role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const existingRole = await Role.findOne({ role });
    if (existingRole) {
      return res.json({
        message: ErrorMessages.RoleExist,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }

    const newRole = new Role({
      role,
    });

    await newRole.save();
    return res.json({
      message: SuccessMessages.RoleCreated,
      status: StatusCodes.Success.Created,
      success: true,
    });
  } catch (error) {
    console.error("Error in register", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
