import Auth from "../models/authModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
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
      message: ErrorMessages.RegisterError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

export const authLogin = async (userData: any) => {
  const { email, password } = userData;
  try {
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter((field) => !userData[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }

    const auth = await Auth.findOne({ email });
    if (!auth) {
      return {
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }

    const isPasswordValid = await bcrypt.compare(password, auth.password || "");
    if (!isPasswordValid) {
      return {
        message: ErrorMessages.IncorrectCredentials,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }

    const token = jwt.sign(
      {
        userId: auth._id,
        fullName: auth.fullName,
        email: auth.email,
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
    console.error("Error in user login", error);
    return {
      message: ErrorMessages.LoginError,
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
    const foundedUser = await Auth.findById({ _id: userId });
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
      message: ErrorMessages.UserNotFound,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
