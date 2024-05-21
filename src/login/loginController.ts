import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Auth from "../auth/models/authModel";
import { envConfig } from "../config/envConfig";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../validation/responseMessages";

// User Login
export const authLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const requiredFields = ["email", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const auth = await Auth.findOne({ email }).populate("role", "role");
    if (!auth) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, auth.password || "");
    if (!isPasswordValid) {
      return res.json({
        message: ErrorMessages.IncorrectCredentials,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }

    const token = jwt.sign(
      {
        userId: auth._id,
        fullName: auth.fullName,
        email: auth.email,
        role: auth.role,
      },
      envConfig.Jwt_Secret,
      { expiresIn: envConfig.Jwt_Expiry_Hours }
    );

    return res.json({
      message: SuccessMessages.SignInSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error in user login", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
