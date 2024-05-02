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
import { passwordResetTemplate } from "../../middleware/mail/emailTemplates";

const otpStore: any = {};

// Forget password
export const forgetPassword = async (email: string) => {
  try {
    const generateOTP = () => {
      const otp = Math.floor(1000 + Math.random() * 9000);
      return otp.toString();
    };
    const user = await Auth.findOne({ email: email });
    if (!user) {
      return {
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    const otp = generateOTP();
    otpStore[email] = otp;

    const mailOptions = {
      from: envConfig.Mail_From,
      to: user.email || "",
      subject: "Reset Password",
      html: passwordResetTemplate(user.fullName, otp),
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
      status: StatusCodes.ServerError.InternalServerError,
      success: false,
    };
  }
};

// Reset password
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const existingUser = await Auth.findOne({ email });
    if (!existingUser) {
      return {
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      };
    }
    const storedOTP = otpStore[email];
    if (!storedOTP || otp !== storedOTP) {
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
      status: StatusCodes.ServerError.InternalServerError,
      success: false,
    };
  }
};
