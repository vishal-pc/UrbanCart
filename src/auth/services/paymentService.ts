import Payment from "../models/paymentModel";
import {
  StatusCodes,
  ErrorMessages,
  SuccessMessages,
} from "../../validation/responseMessages";
import {
  userType,
  CustomRequest,
} from "./../../middleware/jwtToken/authMiddleware";

// Process payment and save payment details
export const processPayment = async (
  req: CustomRequest,
  totalProduct: { productId: string; cartId: string }[],
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
      totalProduct: totalProduct,
      totalCartAmount,
      paymentStatus: "Completed",
    });
    const savedPayment = await newPayment.save();
    if (savedPayment) {
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
      message: ErrorMessages.PaymentError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
