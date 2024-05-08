import { Request, Response } from "express";
import * as cartService from "../services/cartServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Add products to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const result = await cartService.addToCart(req, req.body);
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

// Get all item in the cart
export const getAllCartItems = async (req: Request, res: Response) => {
  try {
    const allProducts = await cartService.getAllCartItems(req);
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

// Get user cart item by id
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

// Remove product quantity from cart
export const removeProductQuantity = async (req: Request, res: Response) => {
  try {
    const cartItemId = req.params.cartItemId;
    const result = await cartService.removeProductQuantity(req, cartItemId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in remove cart items", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Update product quantity in cart
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.cartId;
    const cartItemData = req.body;
    const result = await cartService.updateCartItemQuantity(
      req,
      cartItemData,
      cartId
    );
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in updating cart items", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Delete cart item
export const deleteCartItem = async (req: Request, res: Response) => {
  try {
    const cartId = req.params.cartId;
    const result = await cartService.deleteCartItem(req, cartId);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("Error in deleting cart items", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
