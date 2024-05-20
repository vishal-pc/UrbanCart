import Product from "../models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";
import cloudinary from "../../middleware/cloudflare/cloudinary";
import { CustomRequest, userType } from "../../middleware/token/authMiddleware";
import Auth from "../../auth/models/authModel";
import Category, { ICategories } from "../models/categoriesModel";
import SubCategory, { ISubcategory } from "../models/subCategoriesModels";

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
  const foundUser = await Auth.findById({ _id: userId });
  const {
    categoryName,
    subCategoryName,
    productName,
    productPrice,
    productDescription,
    productStockQuantity,
  } = productData;
  const tempPath = file?.path;
  try {
    const requiredFields = [
      "categoryName",
      "subCategoryName",
      "productName",
      "productPrice",
      "productDescription",
      "productStockQuantity",
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

    const foundCategory: ICategories | null = await Category.findOne({
      categoryName: categoryName,
    });
    if (!foundCategory) {
      return {
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const foundSubCategory: ISubcategory | null = await SubCategory.findOne({
      subCategoryName: subCategoryName,
    });
    if (!foundSubCategory) {
      return {
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
    const newProduct = {
      categoryId: foundCategory._id,
      subCategoryId: foundSubCategory._id,
      productName,
      productPrice,
      productDescription,
      productStockQuantity,
      productImg: secure_url,
      createdBy: foundUser,
    };

    const productSaved = await Product.create(newProduct);
    if (productSaved.id) {
      return {
        message: SuccessMessages.ProductSuccess,
        status: StatusCodes.Success.Created,
        success: true,
        data: {
          _id: productSaved._id,
          productName: productSaved.productName,
          productPrice: productSaved.productPrice,
          productDescription: productSaved.productDescription,
          productImg: productSaved.productImg,
          productStockQuantity: productSaved.productStockQuantity,
          categoryId: {
            _id: foundCategory._id,
            categoryName: foundCategory.categoryName,
            categoryDescription: foundCategory.categoryDescription,
          },
          subCategoryId: {
            _id: foundSubCategory._id,
            subCategoryName: foundSubCategory.subCategoryName,
            subCategoryDescription: foundSubCategory.subCategoryDescription,
          },
          createdBy: {
            _id: foundUser?._id,
            fullname: foundUser?.fullName,
            IsAdmin: foundUser?.IsAdmin,
          },
          createdAt: productSaved.createdAt,
          updatedAt: productSaved.updatedAt,
        },
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
export const getAllProducts = async (
  page: number,
  limit: number,
  searchQuery?: string
) => {
  try {
    let filter: any = {};

    if (searchQuery) {
      const categoryIds = await Category.find({
        $or: [
          { categoryName: { $regex: `^${searchQuery}$`, $options: "i" } },
          {
            categoryDescription: { $regex: `^${searchQuery}$`, $options: "i" },
          },
        ],
      }).distinct("_id");

      const subCategoryIds = await SubCategory.find({
        $or: [
          { subCategoryName: { $regex: `^${searchQuery}$`, $options: "i" } },
          {
            subCategoryDescription: {
              $regex: `^${searchQuery}$`,
              $options: "i",
            },
          },
        ],
      }).distinct("_id");

      filter.$or = [
        { productName: { $regex: `^${searchQuery}$`, $options: "i" } },
        { productDescription: { $regex: `^${searchQuery}$`, $options: "i" } },
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ];
    }

    // const skip = (page - 1) * limit;
    const totalCount = await Product.countDocuments(filter);
    const allProducts = await Product.find(filter);
    // .skip(skip).limit(limit);

    if (allProducts.length > 0) {
      return {
        message: SuccessMessages.ProductFoundSuccess,
        status: 200,
        success: true,
        data: {
          products: allProducts,
          totalCount,
          currentPage: page,
          // totalPages: Math.ceil(totalCount / limit),
        },
      };
    } else {
      return {
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: 400,
      };
    }
  } catch (error) {
    console.error("Error in getting all products", error);
    return {
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: 500,
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
    if (updatedData.productStockQuantity)
      product.productStockQuantity = updatedData.productStockQuantity;

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
