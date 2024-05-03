import { Request, Response } from "express";
import * as cartService from "../services/cartServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Add products to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const result = await cartService.addToCart(req, productId, quantity);
    return res
      .status(result.status || StatusCodes.ServerError.InternalServerError)
      .json(result);
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.ServerError.InternalServerError)
      .json({ message: ErrorMessages.SomethingWentWrong });
  }
};

// Get all iteams in the cart
export const getAllCartIteams = async (req: Request, res: Response) => {
  try {
    const allProducts = await cartService.getAllCartIteams(req);
    return res.status(allProducts.status).json(allProducts);
  } catch (error) {
    console.error("Error in cart products", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get user cart iteam by id
export const getUserCartItemById = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.cartId;
    const allProducts = await cartService.getUserCartItemById(cartId, req);
    return res.status(allProducts.status).json(allProducts);
  } catch (error) {
    console.error("Error in cart products", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
