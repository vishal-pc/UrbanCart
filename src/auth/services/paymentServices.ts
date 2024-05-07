import Payment from "../models/paymentModel";
import Auth from "../models/authModel";
import {
  StatusCodes,
  ErrorMessages,
  SuccessMessages,
} from "../../validation/responseMessages";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import Cart from "../models/cartModel";

// Process payment and save payment details
export const processPayment = async (
  req: CustomRequest,
  totalProduct: {
    productId: string;
    productName: string;
    productPrice: number;
    productQuentity: number;
    productDescription: string;
    cartId: string;
  }[],
  totalCartAmount: number
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

    const newPayment = new Payment({
      buyerUserId: userId,
      totalProduct: totalProduct.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        productQuentity: item.productQuentity,
        productDescription: item.productDescription,
        cartId: item.cartId,
      })),
      totalCartAmount,
      paymentStatus: "Completed",
    });
    const savedPayment = await newPayment.save();
    if (savedPayment) {
      // Delete cartId from Payment table
      await Payment.updateOne(
        { _id: savedPayment._id },
        { $unset: { "totalProduct.$[].cartId": 1 } }
      );
      // Delete object from Cart table with cartId
      await Cart.deleteOne({ _id: totalProduct[0].cartId });
      return {
        message: SuccessMessages.PaymentSuccess,
        success: true,
        status: StatusCodes.Success.Created,
        payment: savedPayment,
      };
    } else {
      return {
        message: ErrorMessages.PaymentError,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
  } catch (error) {
    console.error("Error in processing payment", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get payment details by id
export const getPaymentById = async (paymentId: string) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return {
        message: ErrorMessages.PaymentNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }

    const buyerUserDetails = await Auth.findById({ _id: payment.buyerUserId });
    if (!buyerUserDetails) {
      return {
        message: ErrorMessages.SomethingWentWrong,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      };
    }
    const formattedPayment = {
      _id: payment._id,
      buyerUserDetails: {
        buyerUserId: payment.buyerUserId,
        fullName: buyerUserDetails.fullName,
        email: buyerUserDetails.email,
      },
      totalProduct: payment.totalProduct,
      totalCartAmount: payment.totalCartAmount,
      paymentStatus: payment.paymentStatus,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      __v: payment.__v,
    };
    return {
      message: SuccessMessages.PaymentFoundSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      payment: formattedPayment,
    };
  } catch (error) {
    console.error("Error in getting payment", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
