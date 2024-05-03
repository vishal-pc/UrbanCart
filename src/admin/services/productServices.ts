import Product from "../models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import cloudinary from "../../middleware/cloud/cloudnery";
import {
  CustomRequest,
  userType,
} from "../../middleware/jwtToken/authMiddleware";

// Create a new product
export const createProduct = async (
  req: CustomRequest,
  productData: any,
  file: Express.Multer.File
) => {
  const user = req.user as userType;
  if (!user) {
    return {
      message: ErrorMessages.UserNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    };
  }
  const userId = user.userId;
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
      createdBy: userId,
    };

    const productSaved = await Product.create(newProduct);
    if (productSaved.id) {
      return {
        message: SuccessMessages.ProductSuccess,
        status: StatusCodes.Success.Created,
        success: true,
        productSaved,
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
      message: ErrorMessages.SomethingWentWrong,
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
        status: StatusCodes.Success.Ok,
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
        message: ErrorMessages.ProductGetError,
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      };
    }
  } catch (error) {
    console.error("Error in getting all products", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Get product by id
export const getProductById = async (productId: string) => {
  try {
    const getProduct = await Product.findById(productId);
    if (!getProduct) {
      return {
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    return {
      message: SuccessMessages.ProductFoundSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
      getProduct,
    };
  } catch (error) {
    console.error("Error in getting all products", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

// Update a product by ID
export const updateProductById = async (
  productId: string,
  updatedData: any,
  file: Express.Multer.File
) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return {
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    if (file) {
      const tempPath = file.path;
      const uploadResult = await cloudinary.uploader.upload(tempPath);
      const secure_url = uploadResult.secure_url;
      product.productImg = secure_url;
    }

    if (updatedData.productName) product.productName = updatedData.productName;
    if (updatedData.productPrice)
      product.productPrice = updatedData.productPrice;
    if (updatedData.productDescription)
      product.productDescription = updatedData.productDescription;

    const updatedProduct = await product.save();

    return {
      message: SuccessMessages.ProductUpdatedSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      data: updatedProduct,
    };
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
export const deleteProductById = async (productId: string) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return {
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }

    await product.deleteOne();

    return {
      message: SuccessMessages.ProductDeletedSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
    };
  } catch (error) {
    console.error("Error in deleting product", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
