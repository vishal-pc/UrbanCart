import { Request, Response } from "express";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import Product from "../../admin/models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import Auth from "../models/authModel";
import WishList from "../models/wishlistModel";

// Add to wishlist
export const addToWishlist = async (req: CustomRequest, res: Response) => {
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
    const findUser = await Auth.findById({ _id: userId });

    const { productId } = req.body;

    const foundProduct = await Product.findOne({ _id: productId });
    if (!foundProduct) {
      return res.json({
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const existingWishList = await WishList.findOne({
      buyerUserId: findUser,
      productId: foundProduct._id,
    });
    if (!existingWishList) {
      const newUserWishList = new WishList({
        buyerUserId: findUser,
        productId: foundProduct._id,
      });
      const saveUserWishList = await newUserWishList.save();
      if (saveUserWishList) {
        return res.json({
          message: SuccessMessages.WishlistSuccess,
          success: true,
          status: StatusCodes.Success.Created,
          data: {
            _id: saveUserWishList._id,
            buyerUserId: saveUserWishList.buyerUserId._id,
            productId: saveUserWishList.productId._id,
            createdAt: saveUserWishList.createdAt,
            updatedAt: saveUserWishList.updatedAt,
          },
        });
      } else {
        return res.json({
          message: ErrorMessages.WishlistAddError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        });
      }
    } else {
      return res.json({
        message: ErrorMessages.WishlistAlreadyExist,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
  } catch (error) {
    console.error("Error in adding wishlist", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get user wishlist
export const getUserWishlist = async (req: CustomRequest, res: Response) => {
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

    const findUserWishlist = await WishList.findOne({ buyerUserId: userId });
    if (!findUserWishlist) {
      return res.json({
        message: ErrorMessages.WishlistNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    } else {
      const buyeruserDetails = await Auth.findById({
        _id: findUserWishlist.buyerUserId,
      });
      const productDetails = await Product.findById({
        _id: findUserWishlist.productId,
      });

      return res.json({
        message: SuccessMessages.WishlistFound,
        success: true,
        status: StatusCodes.Success.Ok,
        data: {
          _id: findUserWishlist._id,
          buyerUserId: {
            _id: findUserWishlist.buyerUserId._id,
            fullName: buyeruserDetails?.fullName,
          },
          productId: {
            _id: findUserWishlist.productId._id,
            productName: productDetails?.productName,
            productPrice: productDetails?.productPrice,
            productDescription: productDetails?.productDescription,
            productImg: productDetails?.productImg,
          },
          createdAt: findUserWishlist.createdAt,
          updatedAt: findUserWishlist.updatedAt,
        },
      });
    }
  } catch (error) {
    console.error("Error in getting wishlist", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Deleter user wishlist
export const deleteUserWishlist = async (req: Request, res: Response) => {
  try {
    const { wishlistId } = req.params;
    const deleteUsrWishList = await WishList.findByIdAndDelete({
      _id: wishlistId,
    });
    if (!deleteUsrWishList) {
      return res.json({
        message: ErrorMessages.WishlistNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    } else {
      return res.json({
        message: SuccessMessages.WishlistDelete,
        success: true,
        status: StatusCodes.Success.Ok,
      });
    }
  } catch (error) {
    console.error("Error in getting wishlist", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
