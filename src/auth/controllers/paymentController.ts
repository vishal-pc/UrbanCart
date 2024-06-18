import { Request, Response } from "express";
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
import moment from "moment-timezone";
import Product from "../../admin/models/productModel";
import { generateRandomNumber } from "../../helpers/randomNumber";
import { transporter } from "../../middleware/mail/transPorter";
import {
  orderConfirmTemplateToUser,
  orderConfirmTemplateToAdmin,
} from "../../template/orderConfirm";
import Address from "../models/addressModel";

const stripe = new Stripe(envConfig.Stripe_Secret_key, {
  apiVersion: "2024-04-10",
});

// Process payment and save payment details
export const processPayment = async (req: CustomRequest, res: Response) => {
  try {
    const { totalProduct, totalCartAmount, userAddress } = req.body;
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

    const detailedProducts = await Promise.all(
      totalProduct.map(async (item: any) => {
        const productDetails = await Product.findById(item.productId);
        return {
          ...item,
          productImageUrl: productDetails?.productImg
            ? productDetails.productImg[0]
            : "",
        };
      })
    );

    const detailedAddress = await Promise.all(
      userAddress.map(async (address: any) => {
        await Address.findById(address.addressId);
        return {
          ...address,
        };
      })
    );

    const orderNumber = generateRandomNumber();
    const existingPaymentOrderNumber = await Payment.findOne({
      orderNumber: orderNumber,
    });
    const newOrderNumber = existingPaymentOrderNumber;
    if (!newOrderNumber) {
      const newPayment = new Payment({
        buyerUserId: userId,
        totalProduct: detailedProducts.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productQuantity: item.productQuantity,
          productDescription: item.productDescription,
          itemPrice: item.itemPrice,
          cartId: item.cartId,
          productImageUrl: item.productImageUrl,
        })),
        stripeUserId: customerId,
        orderNumber: orderNumber,
        userAddress: detailedAddress.map((address) => ({
          addressId: address.addressId,
          mobileNumber: address.mobileNumber,
          country: address.country,
          stateId: address.stateId,
          stateName: address.stateName,
          cityId: address.cityId,
          cityName: address.cityName,
          streetAddress: address.streetAddress,
          nearByAddress: address.nearByAddress,
          areaPincode: address.areaPincode,
        })),
        totalCartAmount,
      });

      const savedPayment = await newPayment.save();

      // Store detailed product data in your database instead of metadata
      const productIds = totalProduct
        .map((product: any) => product.productId)
        .join(",");

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
          productIds: productIds, // Store only product IDs
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
        return res.json({
          message: SuccessMessages.PaymentSuccess,
          success: true,
          status: StatusCodes.Success.Created,
          payment: updatedPayment,
          sessionId: session.id,
        });
      } else {
        return res.json({
          message: ErrorMessages.PaymentError,
          success: false,
          status: StatusCodes.ClientError.BadRequest,
        });
      }
    } else {
      return res.json({
        message: ErrorMessages.SomethingWentWrong,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
  } catch (error) {
    console.error("Error in processing payment with Stripe:", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get payment details by id
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.json({
        message: ErrorMessages.PaymentNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const buyerUserDetails = await Auth.findById({ _id: payment.buyerUserId });
    if (!buyerUserDetails) {
      return res.json({
        message: ErrorMessages.SomethingWentWrong,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
    const formattedPayment = {
      _id: payment._id,
      buyerUserDetails: {
        buyerUserId: payment.buyerUserId,
        fullName: buyerUserDetails.fullName,
        email: buyerUserDetails.email,
      },
      addressDetails: payment.userAddress,
      totalProduct: payment.totalProduct,
      totalCartAmount: payment.totalCartAmount,
      paymentStatus: payment.paymentStatus,
      orderNumber: payment.orderNumber,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      __v: payment.__v,
    };
    return res.json({
      message: SuccessMessages.PaymentFoundSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      payment: formattedPayment,
    });
  } catch (error) {
    console.error("Error in getting payment", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
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
          const productDoc = await Product.findById({ _id: product.productId });
          if (productDoc) {
            productDoc.productStockQuantity -= product.productQuantity;
            await productDoc.save();
          } else {
            return {
              message: ErrorMessages.ProductNotFound,
              success: false,
              status: StatusCodes.ClientError.NotFound,
            };
          }
          await Cart.deleteOne({ _id: product.cartId });
        }
        const findUser = await Auth.findById({ _id: payment.buyerUserId });
        const formattedDateAndTime = moment(payment.createdAt).format(
          "DD-MM-YYYY h:mm A"
        );
        const dateTimeFormat = formattedDateAndTime.split(" ");
        const date = dateTimeFormat[0];
        const time = dateTimeFormat[1];
        const dayTime = dateTimeFormat[2];

        let confirmOrderHTML = "";
        for (const product of payment.totalProduct) {
          confirmOrderHTML += `
          <tr>
          <td width="35%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${product.productName}
          </td>
          <td width="23%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
            ${product.productQuantity}
          </td>
          <td width="24%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
            ₹ ${product.productPrice}
          </td>
          <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
            ₹ ${product.itemPrice}
          </td>
        </tr>
          `;
        }

        setTimeout(async () => {
          let orderDataToUser = await orderConfirmTemplateToUser(
            findUser?.fullName || "User",
            findUser?.email || "abc@example.com",
            payment.totalCartAmount,
            date,
            time,
            dayTime,
            confirmOrderHTML,
            payment.orderNumber,
            payment.userAddress[0].streetAddress || "abc",
            payment.userAddress[0].nearByAddress || "abc",
            payment.userAddress[0].cityName || "abc",
            payment.userAddress[0].stateName || "abc",
            payment.userAddress[0].country || "abc",
            payment.userAddress[0].areaPincode || 0,
            payment.userAddress[0].mobileNumber || 0
          );

          const userMailOptions = {
            from: envConfig.Mail_From,
            to: findUser?.email || "",
            subject: "Order Placed Confirmation",
            html: orderDataToUser,
          };

          transporter.sendMail(userMailOptions, (err) => {
            if (err) {
              return {
                message: ErrorMessages.EmailNotSend,
                status: StatusCodes.ClientError.BadRequest,
                success: false,
              };
            }
          });
          let orderDataToAdmin = await orderConfirmTemplateToAdmin(
            findUser?.fullName || "User",
            findUser?.email || "abc@example.com",
            payment.totalCartAmount,
            date,
            time,
            dayTime,
            confirmOrderHTML,
            payment.orderNumber,
            payment.userAddress[0].streetAddress || "abc",
            payment.userAddress[0].nearByAddress || "abc",
            payment.userAddress[0].cityName || "abc",
            payment.userAddress[0].stateName || "abc",
            payment.userAddress[0].country || "abc",
            payment.userAddress[0].areaPincode || 0,
            payment.userAddress[0].mobileNumber || 0
          );

          const adminUsers = await Auth.find({ IsAdmin: true });
          const adminEmails = adminUsers.map((admin) => admin.email);
          // Send notification email to the admin
          const adminMailOptions = {
            from: envConfig.Mail_From,
            to: adminEmails,
            subject: "Order Placed Confirmation",
            html: orderDataToAdmin,
          };
          transporter.sendMail(adminMailOptions, (err) => {
            if (err) {
              return {
                message: ErrorMessages.EmailNotSend,
                status: StatusCodes.ClientError.BadRequest,
                success: false,
              };
            }
          });
        }, 15000);
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
export const getPaymentDetails = async (req: CustomRequest, res: Response) => {
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

    const payments = await Payment.find({
      buyerUserId: userId,
      paymentStatus: "Completed",
    });

    if (!payments || payments.length === 0) {
      return res.json({
        message: ErrorMessages.PaymentNotFound,
        success: false,
        status: StatusCodes.Success.Ok,
        payments: [],
      });
    }

    const formattedPayments = payments.map((payment) => ({
      _id: payment._id,
      totalProduct: payment.totalProduct,
      totalCartAmount: payment.totalCartAmount,
      userAddress: payment.userAddress,
      paymentStatus: payment.paymentStatus,
      buyerUserId: payment.buyerUserId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      __v: payment.__v,
    }));

    return res.json({
      message: SuccessMessages.PaymentFoundSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("Error in getting all user payments", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
