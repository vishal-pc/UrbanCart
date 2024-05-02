import express, { Request } from "express";
import fs from "fs";
import path from "path";
import Auth from "../models/authModel";
import bcrypt from "bcryptjs";
import { envConfig } from "../../config/envConfig";
import { transporter } from "../../middleware/mail/transPorter";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import { passwordRegex } from "../../helpers/helper";

const router = express.Router();
router.use(express.static("public"));

const mailTemplatePath = path.join(__dirname, "../../public/mailTemplate.html");
const mailTemplate = fs.readFileSync(mailTemplatePath, "utf-8");

const otpStore: any = {};

// Forget password
export const forgetPassword = async (email: string) => {
  try {
    const generateOTP = () => {
      const otp = Math.floor(1000 + Math.random() * 9000);
      return otp.toString();
    };
    const otpExpire = 2 * 60 * 1000;

    const user = await Auth.findOne({ email: email });
    if (!user) {
      return {
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + otpExpire };

    const emailContent = mailTemplate
      .replace("${fullName}", user.fullName)
      .replace("${otp}", otp);

    const mailOptions = {
      from: envConfig.Mail_From,
      to: user.email || "",
      subject: "Reset Password",
      html: emailContent,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return {
          message: ErrorMessages.ForgotPasswordError,
          status: StatusCodes.ClientError.BadRequest,
          success: false,
        };
      }
    });

    return {
      message: SuccessMessages.ForgotPasswordSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
    };
  } catch (error) {
    console.error("Error in forget user password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Reset password
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string,
  req: Request
) => {
  try {
    const requiredFields = ["otp", "email", "newPassword", "confirmPassword"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    const existingUser = await Auth.findOne({ email });
    if (!existingUser) {
      return {
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.otp !== otp) {
      return {
        message: ErrorMessages.OtpError,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    if (newPassword !== confirmPassword) {
      return {
        message: ErrorMessages.PasswordSameError,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    if (!passwordRegex.test(confirmPassword)) {
      return {
        message: ErrorMessages.PasswordRequirements,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

    existingUser.password = hashedPassword;
    await existingUser.save();
    delete otpStore[email];

    return {
      message: SuccessMessages.ResetPasswordsSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
    };
  } catch (error) {
    console.error("Error in reset user password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
