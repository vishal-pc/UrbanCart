import { Request, Response } from "express";
import Auth from "../models/authModel";
import bcrypt from "bcryptjs";
import { envConfig } from "../../config/envConfig";
import { transporter } from "../../middleware/mail/transPorter";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import { passwordRegex, validateMobileNumber } from "../../helpers/helper";
import { sendMailForPassword } from "../../template/forgetPassMail";
import Category from "../../admin/models/categoriesModel";
import SubCategory from "../../admin/models/subCategoriesModels";
import Product from "../../admin/models/productModel";
import { userType } from "../../middleware/token/authMiddleware";
import cloudinary from "../../middleware/cloudflare/cloudinary";

const otpStore: any = {};

// Forget password
export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const generateOTP = () => {
      const otp = Math.floor(1000 + Math.random() * 9000);
      return otp.toString();
    };
    const otpExpire = 5 * 60 * 1000;

    const user = await Auth.findOne({ email: email });
    if (!user) {
      return res.json({
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      });
    }
    const otp = generateOTP();
    otpStore[email] = { otp, expiresAt: Date.now() + otpExpire };

    const emailContant = sendMailForPassword(user.fullName, otp);
    const mailOptions = {
      from: envConfig.Mail_From,
      to: user.email || "",
      subject: "Reset Password",
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

    return res.json({
      message: SuccessMessages.ForgotPasswordSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
    });
  } catch (error) {
    console.error("Error in forget user password", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    const requiredFields = ["otp", "email", "newPassword", "confirmPassword"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    const existingUser = await Auth.findOne({ email });
    if (!existingUser) {
      return res.json({
        message: ErrorMessages.EmalNotFound,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      });
    }
    const storedOTP = otpStore[email];
    if (!storedOTP || storedOTP.otp !== otp) {
      return res.json({
        message: ErrorMessages.OtpError,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      });
    }
    if (newPassword !== confirmPassword) {
      return res.json({
        message: ErrorMessages.PasswordSameError,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      });
    }
    if (!passwordRegex.test(confirmPassword)) {
      return res.json({
        message: ErrorMessages.PasswordRequirements,
        status: StatusCodes.ClientError.NotFound,
        success: false,
      });
    }
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

    existingUser.password = hashedPassword;
    await existingUser.save();
    delete otpStore[email];

    return res.json({
      message: SuccessMessages.ResetPasswordSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
    });
  } catch (error) {
    console.error("Error in reset user password", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Change password for user and admin
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user as userType;
    if (!user) {
      return res.json({
        message: ErrorMessages.UserNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const userId = user.userId;
    const findUser = await Auth.findById({ _id: userId });
    if (findUser) {
      const requiredFields = ["oldPassword", "newPassword", "confirmPassword"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        const missingFieldsMessage = missingFields.join(", ");
        return res.json({
          message: ErrorMessages.MissingFields(missingFieldsMessage),
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        });
      }
      if (newPassword !== confirmPassword) {
        return res.json({
          message: ErrorMessages.PasswordSameError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        });
      }
      if (!passwordRegex.test(confirmPassword)) {
        return res.json({
          message: ErrorMessages.PasswordRequirements,
          status: StatusCodes.ClientError.NotFound,
          success: false,
        });
      }
      const isMatch = await bcrypt.compare(oldPassword, findUser.password);
      if (!isMatch) {
        return res.json({
          message: ErrorMessages.IncorrectOldPassword,
          success: false,
          status: StatusCodes.ClientError.Unauthorized,
        });
      }
      const isSamePassword = await bcrypt.compare(
        newPassword,
        findUser.password
      );
      if (isSamePassword) {
        return res.json({
          message: ErrorMessages.SamePasswordError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(confirmPassword, salt);

      findUser.password = hashedPassword;
      await findUser.save();
      return res.json({
        message: SuccessMessages.ChangePasswordSuccess,
        status: StatusCodes.Success.Ok,
        success: true,
      });
    }
  } catch (error) {
    console.error("Error in change password", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
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
    const { fullName, mobileNumber, address } = req.body;
    const file = req.file;

    if (mobileNumber && !validateMobileNumber(mobileNumber)) {
      return res.json({
        message: ErrorMessages.InvalidMobileNumber,
        status: StatusCodes.ClientError.BadRequest,
        success: false,
      });
    }

    const updateData: any = {};

    if (file) {
      const tempPath = file.path;
      const uploadResult = await cloudinary.uploader.upload(tempPath);
      const secure_url = uploadResult.secure_url;
      updateData.profileImg = secure_url;
    }

    if (fullName) updateData.fullName = fullName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address) updateData.address = address;

    const updatedUser = await Auth.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (updatedUser) {
      return res.json({
        message: SuccessMessages.UserUpdatedSuccess,
        success: true,
        status: StatusCodes.Success.Ok,
        data: updatedUser,
      });
    } else {
      return res.json({
        message: ErrorMessages.ProfileUpdateError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in update user profile", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const findCategories = await Category.find({});
    if (!findCategories) {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    } else {
      return res.json({
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        status: StatusCodes.Success.Ok,
        data: findCategories,
      });
    }
  } catch (error) {
    console.error("Error in get categories", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get categories by id with sub categories
export const getCategoriesByIdWithSubCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId } = req.params;
    const findCategories = await Category.findById({ _id: categoryId });
    if (findCategories) {
      const findSubCategories = await SubCategory.find({
        categoryId: findCategories,
      });
      if (findSubCategories) {
        return res.json({
          message: SuccessMessages.CategoriesFoundSuccess,
          success: true,
          status: StatusCodes.Success.Ok,
          data: {
            _id: findCategories._id,
            categoryName: findCategories.categoryName,
            categoryDescription: findCategories.categoryDescription,
            createdAt: findCategories.createdAt,
            updatedAt: findCategories.updatedAt,
            subCategories: findSubCategories.map((subCategory) => ({
              _id: subCategory._id,
              subCategoryName: subCategory?.subCategoryName,
              subCategoryDescription: subCategory?.subCategoryDescription,
              subCategoryImg: subCategory?.subCategoryImg,
              createdAt: subCategory?.createdAt,
              updatedAt: subCategory?.updatedAt,
            })),
          },
        });
      } else {
        return res.json({
          message: ErrorMessages.SubcategoriesNotFound,
          success: false,
          status: StatusCodes.ClientError.NotFound,
        });
      }
    } else {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
  } catch (error) {
    console.error("Error in get categories", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get subcategories by id with products
export const getSubCategoriesByIdWithProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const { subcategoryId } = req.params;
    const findSubCategories = await SubCategory.findById({
      _id: subcategoryId,
    });
    if (findSubCategories) {
      const findProducts = await Product.find({
        subCategoryId: findSubCategories,
      });
      if (findSubCategories) {
        return res.json({
          message: SuccessMessages.SubCategoriesFoundSuccess,
          success: true,
          status: StatusCodes.Success.Ok,
          data: {
            _id: findSubCategories._id,
            categoryName: findSubCategories.subCategoryName,
            categoryDescription: findSubCategories.subCategoryDescription,
            createdAt: findSubCategories.createdAt,
            updatedAt: findSubCategories.updatedAt,
            Products: findProducts.map((product) => ({
              _id: product?._id,
              productName: product?.productName,
              productPrice: product?.productPrice,
              productDescription: product?.productDescription,
              productImg: product?.productImg,
              createdAt: product?.createdAt,
              updatedAt: product?.updatedAt,
            })),
          },
        });
      } else {
        return res.json({
          message: ErrorMessages.ProductNotFound,
          success: false,
          status: StatusCodes.ClientError.NotFound,
        });
      }
    } else {
      return res.json({
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
  } catch (error) {
    console.error("Error in get subcategories", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
