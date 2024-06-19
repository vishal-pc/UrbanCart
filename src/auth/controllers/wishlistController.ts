import { Request, Response } from "express";
import { userType } from "../../middleware/token/authMiddleware";
import Product from "../../admin/models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import Auth from "../models/authModel";
import WishList from "../models/wishlistModel";

// Add to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
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
export const getUserWishlist = async (req: Request, res: Response) => {
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

    const userWishlists = await WishList.find({ buyerUserId: userId });
    if (!userWishlists || userWishlists.length === 0) {
      return res.json({
        message: ErrorMessages.WishlistNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    } else {
      const wishlistDetails = await Promise.all(
        userWishlists.map(async (wishlist) => {
          const buyeruserDetails = await Auth.findById(wishlist.buyerUserId);
          const productDetails = await Product.findById(wishlist.productId);

          return {
            _id: wishlist._id,
            buyerUserId: {
              _id: wishlist.buyerUserId,
              fullName: buyeruserDetails?.fullName,
            },
            productId: {
              _id: wishlist.productId,
              productName: productDetails?.productName,
              productPrice: productDetails?.productPrice,
              productDescription: productDetails?.productDescription,
              productImg: productDetails?.productImg,
            },
            createdAt: wishlist.createdAt,
            updatedAt: wishlist.updatedAt,
          };
        })
      );

      return res.json({
        message: SuccessMessages.WishlistFound,
        success: true,
        status: StatusCodes.Success.Ok,
        data: wishlistDetails,
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
