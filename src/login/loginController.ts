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
import { Role } from "../admin/models/roleModel";
import admin from "../middleware/firebase/firebase";

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

// goole login
export const googlelogin = async (req: Request, res: Response) => {
  const googleToken = req.body.token;
  try {
    const decodedToken = await admin.auth().verifyIdToken(googleToken);
    const { uid, name, email, firebase } = decodedToken;
    const sign_in_provider = firebase.sign_in_provider;
    const defaultRole = await Role.findOne({ role: "user" });
    let user = await Auth.findOne({ $or: [{ uid }, { email }] }).populate(
      "role",
      "role"
    );
    if (!user) {
      user = await Auth.create({
        uid: uid,
        email: email,
        fullName: name,
        role: defaultRole,
        provider: sign_in_provider,
        userLogin: true,
      });
    }
    const token = jwt.sign(
      {
        userId: user?._id,
        fullName: user?.fullName,
        email: user?.email,
        role: user?.role,
        userLogin: user?.userLogin,
        provider: user?.provider,
        uid: user?.uid,
      },
      envConfig.Jwt_Secret,
      { expiresIn: envConfig.Jwt_Expiry_Hours }
    );
    return res.status(200).json({
      message: SuccessMessages.SignInSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
      token,
    });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};
