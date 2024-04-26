import Product from "../models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import cloudinary from "../../middleware/cloud/cloudnery";

// Create a new product
export const createProduct = async (
  productData: any,
  file: Express.Multer.File
) => {
  const { productName, productPrice, productDescription } = productData;
  const tempPath = file?.path;
  try {
    const requiredFields = [
      "productName",
      "productPrice",
      "productDescription",
    ];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return {
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
    if (!file) {
      return {
        message: ErrorMessages.FileUploadError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const uploadResult = await cloudinary.uploader.upload(tempPath);
    const secure_url = uploadResult.secure_url;
    const newProduct = {
      productName,
      productPrice,
      productDescription,
      productImg: secure_url,
    };

    const productSaved = await Product.create(newProduct);
    if (productSaved.id) {
      return {
        message: SuccessMessages.ProductSuccess,
        status: StatusCodes.Success.Created,
        success: true,
      };
    } else {
      return {
        message: ErrorMessages.ProductError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      };
    }
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
export const getAllProducts = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const totalCount = await Product.countDocuments();
    const allProducts = await Product.find().skip(skip).limit(limit);
    if (allProducts.length > 0) {
      return {
        message: SuccessMessages.ProductFoundSuccess,
        status: StatusCodes.DataFound.Found,
        success: true,
        data: {
          products: allProducts,
          totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } else {
      return {
        message: ErrorMessages.ProductError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
  } catch (error) {
    console.error("Error in getting all products", error);
    return {
      message: ErrorMessages.ProductError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
