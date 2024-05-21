import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Auth, { IAuth } from "../../auth/models/authModel";
import { emailValidate, passwordRegex } from "../../helpers/helper";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";

// Register admin
export const registerAdmin = async (req: Request, res: Response) => {
  const { fullName, email, password, role } = req.body;
  try {
    const requiredFields = ["fullName", "email", "password", "role"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    if (!emailValidate(email)) {
      return res.json({
        message: ErrorMessages.EmailInvalid,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.json({
        message: ErrorMessages.UserExists(email),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return res.json({
        message: ErrorMessages.PasswordRequirements,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      IsAdmin: true,
      role,
    };

    const userSaved = await Auth.create(newUser);
    if (userSaved.id) {
      return res.json({
        message: SuccessMessages.RegisterSuccess,
        status: StatusCodes.Success.Created,
        success: true,
      });
    } else {
      return res.json({
        message: ErrorMessages.RegisterError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in register", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await Auth.find().populate("role", "role");
    if (!users) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userData = users.map((user: IAuth) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    return res.json({
      message: SuccessMessages.UserFound,
      status: StatusCodes.Success.Ok,
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error in getting users", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
