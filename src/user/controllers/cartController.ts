import { Request, Response } from "express";
import * as cartService from "../services/cartService";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Add products to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.addToCart(req);
    return res
      .status(result.status || StatusCodes.ServerError.InternalServerError)
      .json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.ServerError.InternalServerError)
      .json({ message: ErrorMessages.ProductError });
  }
};

// Get all iteams in the cart
export const getAllCartIteams = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const allProducts = await cartService.getAllCartIteams(page, limit);
    return res.status(allProducts.status).json(allProducts);
  } catch (error) {
    console.error("Error in cart products", error);
    return {
      message: ErrorMessages.ProductError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
