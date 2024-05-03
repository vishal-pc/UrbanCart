import {
  ErrorMessages,
  StatusCodes,
  SuccessMessages,
} from "../../validation/responseMessages";
import { Role } from "../models/roleModel";

// create Role
export const createRole = async (roleData: any) => {
  try {
    const { role } = roleData;
    const existingRole = await Role.findOne({ role });
    if (existingRole) {
      return {
        message: ErrorMessages.RoleExist,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }

    const newRole = new Role({
      role,
    });

    await newRole.save();
    return {
      message: SuccessMessages.RoleCreated,
      status: StatusCodes.Success.Created,
      success: true,
    };
  } catch (error) {
    console.error("Error in register", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
