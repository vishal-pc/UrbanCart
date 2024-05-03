import { Request, Response } from "express";
import * as paymentService from "../services/paymentServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new payment
export const processPayment = async (req: Request, res: Response) => {
  const { totalProduct, totalCartAmount } = req.body;
  try {
    const result = await paymentService.processPayment(
      req,
      totalProduct,
      totalCartAmount
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in payment", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get payment details by id
export const getPaymentById = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  try {
    const result = await paymentService.getPaymentById(paymentId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in getting payment", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
