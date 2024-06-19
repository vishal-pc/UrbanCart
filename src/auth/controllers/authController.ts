import { Request, Response } from "express";
import Auth from "../models/authModel";
import bcrypt from "bcryptjs";
import { emailValidate, passwordRegex } from "../../helpers/helper";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import { userType } from "../../middleware/token/authMiddleware";
import { Role } from "../../admin/models/roleModel";

// User Register
export const authRegister = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  try {
    const requiredFields = ["fullName", "email", "password"];
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

    if (!passwordRegex.test(password)) {
      return res.json({
        message: ErrorMessages.PasswordRequirements,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const defaultRole = await Role.findOne({ role: "user" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      role: defaultRole,
      userLogin: false,
      IsAdmin: false,
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
    console.error("Error in user register", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get auth user By id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;
    const foundedUser = await Auth.findById({ _id: userId }).populate(
      "role",
      "role"
    );
    if (!foundedUser) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userData = {
      _id: foundedUser.id,
      fullName: foundedUser.fullName,
      email: foundedUser.email,
      mobileNumber: foundedUser.mobileNumber || "null",
      profileImg: foundedUser.profileImg || "null",
      address: foundedUser.address || "null",
      role: foundedUser.role,
      createdAt: foundedUser.createdAt,
      updatedAt: foundedUser.updatedAt,
    };
    return res.json({
      message: SuccessMessages.UserFound,
      status: StatusCodes.Success.Ok,
      success: true,
      userData,
    });
  } catch (error) {
    console.error("Error in getting user by id", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
