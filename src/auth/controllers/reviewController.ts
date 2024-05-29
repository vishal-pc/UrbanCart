import { Request, Response } from "express";
import Auth from "../models/authModel";
import Product from "../../admin/models/productModel";
import Review, { IReview } from "../models/reviewModel";
import {
  StatusCodes,
  ErrorMessages,
  SuccessMessages,
} from "../../validation/responseMessages";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import cloudinary from "../../middleware/cloudflare/cloudinary";
import Payment from "../models/paymentModel";
import { transporter } from "../../middleware/mail/transPorter";
import { sendMailForReview } from "../../template/reviewMail";
import { envConfig } from "../../config/envConfig";

//Add product review
export const productReview = async (req: CustomRequest, res: Response) => {
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

    const { productId, rating, comment } = req.body;

    const requiredFields = ["productId", "rating", "comment"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.json({
        message: ErrorMessages.FileUploadError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const uploadResults = await Promise.all(uploadPromises);
    const secure_urls = uploadResults.map((result) => result.secure_url);

    const userEligbleForReview = await Payment.findOne({
      buyerUserId: userId,
      "totalProduct.productId": productId,
    });
    if (!userEligbleForReview) {
      return res.json({
        message: ErrorMessages.UserNotEligibleForReview,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const newUserReview: IReview = new Review({
      productId,
      userId: userId,
      rating,
      comment,
      productImg: secure_urls,
    });
    const saveUserReview = await newUserReview.save();

    const foundUser = await Auth.findById({ _id: saveUserReview.userId });

    const foundproduct = await Product.findById({ _id: productId });

    const emailContant = sendMailForReview(
      foundUser?.fullName || "User",
      foundproduct?.productName || "Product"
    );

    const mailOptions = {
      from: envConfig.Mail_From,
      to: foundUser?.email || "",
      subject: "Thank You for Choosing UrbanCart Product!",
      html: emailContant,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.json({
          message: ErrorMessages.EmailNotSend,
          status: StatusCodes.ClientError.BadRequest,
          success: false,
        });
      }
    });
    if (saveUserReview) {
      return res.json({
        message: SuccessMessages.ReviewSuccess,
        success: true,
        status: StatusCodes.Success.Created,
        data: newUserReview,
      });
    } else {
      return res.json({
        message: ErrorMessages.ReviewAddError,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
  } catch (error) {
    console.error("Error in submiting product review:", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all user product reviews
export const getAllProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({}).populate("userId", "fullName");
    if (!reviews || reviews.length === 0) {
      return res.json({
        message: ErrorMessages.ReviewNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const reviewData = await Promise.all(
      reviews.map(async (review) => {
        const user = await Auth.findById(review.userId);
        return {
          _id: review._id,
          userId: user
            ? {
                _id: user._id,
                fullName: user.fullName,
                address: user?.address,
              }
            : null,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          productImg: review.productImg,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      })
    );

    return res.json({
      message: SuccessMessages.ReviewFound,
      success: true,
      status: StatusCodes.Success.Ok,
      data: reviewData,
    });
  } catch (error) {
    console.error("Error in submiting product review:", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Chekc for eligible for review submit
export const checkReviewForSubmit = async (
  req: CustomRequest,
  res: Response
) => {
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
    const { productId } = req.params;
    const userEligbleForReview = await Payment.findOne({
      buyerUserId: userId,
      "totalProduct.productId": productId,
    });
    if (!userEligbleForReview) {
      return res.json({
        message: ErrorMessages.UserNotEligibleForReview,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in submiting product review:", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
