import { Request, Response } from "express";
import Auth from "../models/authModel";
import Product from "../../admin/models/productModel";
import {
  StatusCodes,
  ErrorMessages,
  SuccessMessages,
} from "../../validation/responseMessages";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import { transporter } from "../../middleware/mail/transPorter";
import { contactUsMail } from "../../template/contactUs";
import { envConfig } from "../../config/envConfig";
import ContactUs, { IContact } from "../models/contactUsModel";

// Contact use api
export const contactUsEmail = async (req: CustomRequest, res: Response) => {
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

    const {
      reasonForContact,
      productId,
      userName,
      userMobileNumber,
      userEmail,
      userComment,
    } = req.body;
    const requiredFields = [
      "reasonForContact",
      "userName",
      "userMobileNumber",
      "userEmail",
      "userComment",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const newUserContactUsData: IContact = new ContactUs({
      userId,
      productId,
      reasonForContact,
      userName,
      userMobileNumber,
      userEmail,
      userComment,
    });
    const saveUserContactUsData = await newUserContactUsData.save();

    const foundUser = await Auth.findById({
      _id: saveUserContactUsData.userId,
    });
    const foundproduct = await Product.findById({
      _id: saveUserContactUsData.productId,
    });

    const adminUsers = await Auth.find({ IsAdmin: true });
    const emailPromise = adminUsers.map((admin) => {
      const emailContant = contactUsMail(
        admin.fullName,
        foundUser?.fullName || "User",
        foundproduct?.productName || "Product",
        saveUserContactUsData?.reasonForContact || "",
        saveUserContactUsData?.userName || "",
        saveUserContactUsData?.userMobileNumber || 0,
        saveUserContactUsData?.userEmail || "",
        saveUserContactUsData?.userComment || ""
      );

      const mailOptions = {
        from: envConfig.Mail_From,
        to: admin.email || "",
        subject: `A new ${reasonForContact} has been received`,
        html: emailContant,
      };

      return transporter.sendMail(mailOptions, (err) => {
        if (err) {
          return res.json({
            message: ErrorMessages.EmailNotSend,
            status: StatusCodes.ClientError.BadRequest,
            success: false,
          });
        }
      });
    });
    await Promise.all(emailPromise);

    if (saveUserContactUsData) {
      return res.json({
        message: SuccessMessages.ContactUs,
        success: true,
        status: StatusCodes.Success.Created,
      });
    } else {
      return res.json({
        message: ErrorMessages.ContactUsError,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
  } catch (error) {
    console.error("Error in submiting review:", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
