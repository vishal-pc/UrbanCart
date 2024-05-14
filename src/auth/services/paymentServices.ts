import Payment from "../models/paymentModel";
import Auth from "../models/authModel";
import {
  StatusCodes,
  ErrorMessages,
  SuccessMessages,
} from "../../validation/responseMessages";
import { userType, CustomRequest } from "../../middleware/token/authMiddleware";
import { envConfig } from "../../config/envConfig";
import Cart from "../models/cartModel";
import Stripe from "stripe";

const stripe = new Stripe(envConfig.Stripe_Secret_key, {
  apiVersion: "2024-04-10",
});

// Process payment and save payment details
export const processPayment = async (
  req: CustomRequest,
  totalProduct: {
    productId: string;
    productName: string;
    productPrice: number;
    productQuantity: number;
    productDescription: string;
    itemPrice: number;
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
    const findUser = await Auth.findById({ _id: userId });

    let customerId = "";
    if (findUser?.stripeUserId) {
      customerId = findUser.stripeUserId;
      const checkIdFromStripe = await stripe.customers.retrieve(customerId);
      if (checkIdFromStripe?.deleted) {
        const customer = await stripe.customers.create({
          name: findUser.fullName,
          email: findUser.email,
        });
        customerId = customer.id;
        findUser.stripeUserId = customer.id;
        await findUser?.save();
      } else {
        customerId = findUser?.stripeUserId;
      }
    } else if (findUser) {
      const customer = await stripe.customers.create({
        name: findUser.fullName,
        email: findUser.email,
      });
      customerId = customer.id;
      findUser.stripeUserId = customer.id;
      await findUser?.save();
    }

    const newPayment = new Payment({
      buyerUserId: userId,
      totalProduct: totalProduct.map((item) => ({
        to: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        productQuantity: item.productQuantity,
        productDescription: item.productDescription,
        itemPrice: item.itemPrice,
        cartId: item.cartId,
      })),
      stripeUserId: customerId,
      totalCartAmount,
    });

    const savedPayment = await newPayment.save();

    const productMetadata = JSON.stringify(
      totalProduct.map((product) => ({
        productName: product.productName,
        productPrice: product.productPrice,
        productQuantity: product.productQuantity,
        productDescription: product.productDescription,
        itemPrice: product.itemPrice,
        cartId: product.cartId,
      }))
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: totalProduct.map((item: any) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.productName,
          },
          unit_amount: item.productPrice * 100,
        },
        quantity: item.productQuantity,
      })),
      mode: "payment",
      success_url: envConfig.Success_Redirect,
      cancel_url: envConfig.Cancel_Redirect,
      customer: customerId,
      client_reference_id: String(savedPayment._id),
      metadata: {
        userId: String(user.userId),
        products: productMetadata,
        totalCartAmount: String(savedPayment.totalCartAmount),
      },
    });

    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: savedPayment._id },
      {
        stripePayment: session,
      }
    );
    if (updatedPayment) {
      return {
        message: SuccessMessages.PaymentSuccess,
        success: true,
        status: StatusCodes.Success.Created,
        payment: updatedPayment,
        sessionId: session.id,
      };
    } else {
      return {
        message: ErrorMessages.PaymentError,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
  } catch (error) {
    console.error("Error in processing payment with Stripe:", error);
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
      // stripePayment: payment.stripePayment,
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

// Update payent intent status
export const updatePaymentIntent = async (stripePayment: any) => {
  try {
    const updatePaymentIntent = await Payment.findOneAndUpdate(
      { "stripePayment.id": stripePayment.id },
      { $set: { paymentStatus: "Completed" } }
    );
    if (updatePaymentIntent) {
      const payment = await Payment.findById(updatePaymentIntent._id);
      if (payment?.paymentStatus === "Completed") {
        await Payment.updateOne(
          { _id: updatePaymentIntent._id },
          { $unset: { "totalProduct.$[].cartId": 1 } }
        );
        for (const product of payment.totalProduct) {
          await Cart.deleteOne({ _id: product.cartId });
        }
      }
      return true;
    } else {
      console.error("Payment record not found");
      return false;
    }
  } catch (error) {
    console.error("Error in update payment intent:", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all payment details
export const getPaymentDetails = async (req: CustomRequest) => {
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

    const payments = await Payment.find({ buyerUserId: userId });

    if (!payments || payments.length === 0) {
      return {
        message: ErrorMessages.PaymentNotFound,
        success: false,
        status: StatusCodes.Success.Ok,
        payments: [],
      };
    }

    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      totalProduct: payment.totalProduct,
      totalCartAmount: payment.totalCartAmount,
      paymentStatus: payment.paymentStatus,
      buyerUserId: payment.buyerUserId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      __v: payment.__v,
    }));

    return {
      message: SuccessMessages.PaymentFoundSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      payments: formattedPayments,
    };
  } catch (error) {
    console.error("Error in getting all user payments", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
