import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel";
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
import Auth, { IAuth } from "../../auth/models/authModel";

// Register admin
export const registerAdmin = async (adminData: any) => {
  const { fullName, email, password, type } = adminData;
  try {
    const requiredFields = ["fullName", "email", "password", "type"];
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
    const existingUser = await Admin.findOne({ email });
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
      type,
    };

    const userSaved = await Admin.create(newUser);
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

// Login admin
export const loginAdmin = async (adminData: any) => {
  const { email, password } = adminData;
  try {
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter((field) => !adminData[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password || ""
    );
    if (!isPasswordValid) {
      return {
        message: ErrorMessages.IncorrectCredentials,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }

    const token = jwt.sign(
      {
        userId: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        type: admin.type,
        IsAdmin: admin.IsAdmin,
      },
      envConfig.Jwt_Secret,
      { expiresIn: envConfig.Jwt_Expiry_Hours }
    );

    return {
      message: SuccessMessages.SignInSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
      token,
    };
  } catch (error) {
    console.error("Error in login", error);
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
    const foundedUser = await Admin.findById({ _id: userId });
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
      type: foundedUser.type,
      IsAdmin: foundedUser.IsAdmin,
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
    const users = await Auth.find();
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
