import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth, { IAuth } from "../../auth/models/authModel";
import { emailValidate, passwordRegex } from "../../helpers/helper";
import { envConfig } from "../../config/envConfig";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import {
  CustomRequest,
  userType,
} from "../../middleware/jwtToken/authMiddleware";

// Register admin
export const registerAdmin = async (adminData: any) => {
  const { fullName, email, password, role } = adminData;
  try {
    const requiredFields = ["fullName", "email", "password", "role"];
    const missingFields = requiredFields.filter((field) => !adminData[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    if (!emailValidate(email)) {
      return {
        message: ErrorMessages.EmailInvalid,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return {
        message: ErrorMessages.UserExists(email),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    // Validate password strength
    if (!passwordRegex.test(password)) {
      return {
        message: ErrorMessages.PasswordRequirements,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
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
      return {
        message: SuccessMessages.RegisterSuccess,
        status: StatusCodes.Success.Created,
        success: true,
      };
    } else {
      return {
        message: ErrorMessages.RegisterError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      };
    }
  } catch (error) {
    console.error("Error in register", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get admin user By id
export const getAdminById = async (req: CustomRequest) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userId = user.userId;
    const foundedUser = await Auth.findById({ _id: userId }).populate(
      "role",
      "role"
    );
    if (!foundedUser) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userData = {
      _id: foundedUser.id,
      fullName: foundedUser.fullName,
      email: foundedUser.email,
      IsAdmin: foundedUser.IsAdmin,
      role: foundedUser.role,
      createdAt: foundedUser.createdAt,
      updatedAt: foundedUser.updatedAt,
    };
    return {
      message: SuccessMessages.UserFound,
      status: StatusCodes.Success.Ok,
      success: true,
      userData,
    };
  } catch (error) {
    console.error("Error in getting user by id", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const users = await Auth.find().populate("role", "role");
    if (!users) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const userData = users.map((user: IAuth) => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    return {
      message: SuccessMessages.UserFound,
      status: StatusCodes.Success.Ok,
      success: true,
      userData,
    };
  } catch (error) {
    console.error("Error in getting users", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
