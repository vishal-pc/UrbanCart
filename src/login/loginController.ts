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
import { CustomRequest, userType } from "../middleware/token/authMiddleware";

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
    await Auth.findByIdAndUpdate(auth._id, { userLogin: true }, { new: true });
    const updatedAuth = await Auth.findById(auth._id).populate("role", "role");

    const token = jwt.sign(
      {
        userId: updatedAuth?._id,
        fullName: updatedAuth?.fullName,
        email: updatedAuth?.email,
        role: updatedAuth?.role,
        userLogin: updatedAuth?.userLogin,
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

// logout api
export const authLogout = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return res.status(StatusCodes.ClientError.NotFound).json({
        message: ErrorMessages.UserNotFound,
        success: false,
      });
    }
    const userId = user.userId;

    // Update the user's login status to false
    await Auth.findByIdAndUpdate(
      { _id: userId },
      { $set: { userLogin: false } }
    );

    return res.json({
      message: SuccessMessages.SignOutSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
    });
  } catch (error) {
    console.error("Error in user logout", error);
    return res.status(StatusCodes.ServerError.InternalServerError).json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
    });
  }
};
