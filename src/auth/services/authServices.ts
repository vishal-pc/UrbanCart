import Auth from "../models/authModel";
import bcrypt from "bcryptjs";
import { emailValidate, passwordRegex } from "../../helpers/helper";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import {
  CustomRequest,
  userType,
} from "../../middleware/jwtToken/authMiddleware";
import { Role } from "../../admin/models/roleModel";

// User Register
export const authRegister = async (userData: any) => {
  const { fullName, email, password } = userData;
  try {
    const requiredFields = ["fullName", "email", "password"];
    const missingFields = requiredFields.filter((field) => !userData[field]);

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

    if (!passwordRegex.test(password)) {
      return {
        message: ErrorMessages.PasswordRequirements,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const defaultRole = await Role.findOne({ role: "user" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      role: defaultRole,
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
    console.error("Error in user register", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get auth user By id
export const getUserById = async (req: CustomRequest) => {
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
