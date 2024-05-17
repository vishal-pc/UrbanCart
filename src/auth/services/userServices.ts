import { Request } from "express";
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
import { sendMailForPassword } from "../../template/forgetPassMail";
import Category from "../../admin/models/categoriesModel";
import SubCategory from "../../admin/models/subCategoriesModels";
import Product from "../../admin/models/productModel";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";

const otpStore: any = {};

// Forget password
export const forgetPassword = async (email: string) => {
  try {
    const generateOTP = () => {
      const otp = Math.floor(1000 + Math.random() * 9000);
      return otp.toString();
    };
    const otpExpire = 5 * 60 * 1000;

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

    const emailContant = sendMailForPassword(user.fullName, otp);
    const mailOptions = {
      from: envConfig.Mail_From,
      to: user.email || "",
      subject: "Reset Password",
      html: emailContant,
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
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

    existingUser.password = hashedPassword;
    await existingUser.save();
    delete otpStore[email];

    return {
      message: SuccessMessages.ResetPasswordSuccess,
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

// Change password for user and admin
export const changePassword = async (
  req: CustomRequest,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
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
    const findUser = await Auth.findById({ _id: userId });
    if (findUser) {
      const requiredFields = ["oldPassword", "newPassword", "confirmPassword"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        const missingFieldsMessage = missingFields.join(", ");
        return {
          message: ErrorMessages.MissingFields(missingFieldsMessage),
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        };
      }
      if (newPassword !== confirmPassword) {
        return {
          message: ErrorMessages.PasswordSameError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        };
      }
      if (!passwordRegex.test(confirmPassword)) {
        return {
          message: ErrorMessages.PasswordRequirements,
          status: StatusCodes.ClientError.NotFound,
          success: false,
        };
      }
      const isMatch = await bcrypt.compare(oldPassword, findUser.password);
      if (!isMatch) {
        return {
          message: ErrorMessages.IncorrectOldPassword,
          success: false,
          status: StatusCodes.ClientError.Unauthorized,
        };
      }
      const isSamePassword = await bcrypt.compare(
        newPassword,
        findUser.password
      );
      if (isSamePassword) {
        return {
          message: ErrorMessages.SamePasswordError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        };
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(confirmPassword, salt);

      findUser.password = hashedPassword;
      await findUser.save();
      return {
        message: SuccessMessages.ChangePasswordSuccess,
        status: StatusCodes.Success.Ok,
        success: true,
      };
    }
  } catch (error) {
    console.error("Error in change password", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const findCategories = await Category.find({});
    if (!findCategories) {
      return {
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    } else {
      return {
        message: SuccessMessages.CategoriesFoundSuccess,
        success: true,
        status: StatusCodes.Success.Ok,
        data: findCategories,
      };
    }
  } catch (error) {
    console.error("Error in get categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get categories by id with sub categories
export const getCategoriesByIdWithSubCategories = async (categoryId: any) => {
  try {
    const findCategories = await Category.findById({ _id: categoryId });
    if (findCategories) {
      const findSubCategories = await SubCategory.find({
        categoryId: findCategories,
      });
      if (findSubCategories) {
        return {
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
              createdAt: subCategory?.createdAt,
              updatedAt: subCategory?.updatedAt,
            })),
          },
        };
      } else {
        return {
          message: ErrorMessages.SubcategoriesNotFound,
          success: false,
          status: StatusCodes.ClientError.NotFound,
        };
      }
    } else {
      return {
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
  } catch (error) {
    console.error("Error in get categories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get subcategories by id with products
export const getSubCategoriesByIdWithProducts = async (subcategoryId: any) => {
  try {
    const findSubCategories = await SubCategory.findById({
      _id: subcategoryId,
    });
    if (findSubCategories) {
      const findProducts = await Product.find({
        subCategoryId: findSubCategories,
      });
      if (findSubCategories) {
        return {
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
        };
      } else {
        return {
          message: ErrorMessages.ProductNotFound,
          success: false,
          status: StatusCodes.ClientError.NotFound,
        };
      }
    } else {
      return {
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
  } catch (error) {
    console.error("Error in get subcategories", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
