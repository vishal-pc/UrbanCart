import { Request, Response } from "express";
import * as paymentService from "../services/paymentServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

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
      message: ErrorMessages.PaymentError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
