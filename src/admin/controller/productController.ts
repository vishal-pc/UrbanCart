import { Request, Response } from "express";
import * as productServices from "../services/productServices";
import { StatusCodes, ErrorMessages } from "../../validation/responseMessages";

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  const productData = req.body;
  const file = req.file as Express.Multer.File | undefined;

  try {
    const createdProduct = await productServices.createProduct(
      req,
      productData,
      file as Express.Multer.File
    );

    return res.status(createdProduct.status).json(createdProduct);
  } catch (error) {
    console.error("Error in creating product", error);
    return {
      message: ErrorMessages.ProductError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchQuery = req.query.searchQuery as string;
  try {
    const allProducts = await productServices.getAllProducts(
      page,
      limit,
      searchQuery
    );
    return res.status(allProducts.status).json(allProducts);
  } catch (error) {
    console.error("Error in getting all products", error);
    return {
      message: ErrorMessages.ProductError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get a product by ID
export const getProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;

  try {
    const product = await productServices.getProductById(productId);
    return res.status(product.status).json(product);
  } catch (error) {
    console.error("Error in getting product by id", error);
    return {
      message: ErrorMessages.ProductGetError,
      success: false,
      status: StatusCodes.ClientError.BadRequest,
    };
  }
};

// Update a product by ID
export const updateProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;
  const updatedData = req.body;
  const file = req.file as Express.Multer.File | undefined;

  try {
    const updatedProduct = await productServices.updateProductById(
      productId,
      updatedData,
      file as Express.Multer.File
    );

    return res.status(updatedProduct.status).json(updatedProduct);
  } catch (error) {
    console.error("Error in updating product", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Delete a product by ID
export const deleteProductById = async (req: Request, res: Response) => {
  const productId = req.params.productId;

  try {
    const deletedProduct = await productServices.deleteProductById(productId);
    return res.status(deletedProduct.status).json(deletedProduct);
  } catch (error) {
    console.error("Error in deleting product", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
