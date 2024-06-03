import { Request, Response } from "express";
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
import { parseSearchQuery } from "../../helpers/randomNumber";
import { shuffleArray } from "../../helpers/helper";

// Create a new product
export const createProduct = async (req: CustomRequest, res: Response) => {
  const user = req.user as userType;
  if (!user) {
    return res.json({
      message: ErrorMessages.UserNotFound,
      success: false,
      status: StatusCodes.ClientError.NotFound,
    });
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
    productBrand,
    productShortDescription,
    productFeature,
  } = req.body;
  const files = req.files as Express.Multer.File[];
  try {
    const requiredFields = [
      "categoryName",
      "subCategoryName",
      "productName",
      "productPrice",
      "productDescription",
      "productStockQuantity",
      "productFeature",
      "productBrand",
      "productShortDescription",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(", ");
      return res.json({
        message: ErrorMessages.MissingFields(missingFieldsMessage),
        success: false,
        status: StatusCodes.ClientError.BadRequest,
      });
    }
    if (!files || files.length === 0) {
      return res.json({
        message: ErrorMessages.FileUploadError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path)
    );
    const uploadResults = await Promise.all(uploadPromises);
    const secure_urls = uploadResults.map((result) => result.secure_url);

    const foundCategory: ICategories | null = await Category.findOne({
      categoryName: categoryName,
    });
    if (!foundCategory) {
      return res.json({
        message: ErrorMessages.CategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const foundSubCategory: ISubcategory | null = await SubCategory.findOne({
      subCategoryName: subCategoryName,
    });
    if (!foundSubCategory) {
      return res.json({
        message: ErrorMessages.SubcategoriesNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    const newProduct = {
      categoryId: foundCategory._id,
      subCategoryId: foundSubCategory._id,
      productName,
      productPrice,
      productDescription,
      productStockQuantity,
      productBrand,
      productShortDescription,
      productFeature,
      productImg: secure_urls,
      createdBy: foundUser,
    };

    const productSaved = await Product.create(newProduct);
    if (productSaved.id) {
      return res.json({
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
          productBrand: productSaved.productBrand,
          productShortDescription: productSaved.productShortDescription,
          productFeature: productSaved.productFeature,
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
      });
    } else {
      return res.json({
        message: ErrorMessages.ProductError,
        success: false,
        status: StatusCodes.ServerError.InternalServerError,
      });
    }
  } catch (error) {
    console.error("Error in creating product", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { searchQuery } = req.query;
    let filter: any = {};

    const distinctProductNames = await Product.distinct("productName");
    const distinctCategoryNames = await Category.distinct("categoryName");
    const distinctSubCategoryNames = await SubCategory.distinct(
      "subCategoryName"
    );

    if (searchQuery) {
      const parsedQuery = parseSearchQuery(searchQuery as string);
      const { keywords, priceRange, attributes } = parsedQuery;

      let categoryIds: string[] = [];
      let subCategoryIds: string[] = [];
      let productKeywords: string[] = [];
      let otherKeywords: string[] = [];

      keywords.forEach((keyword: any) => {
        if (
          distinctProductNames.includes(keyword) ||
          distinctCategoryNames.includes(keyword) ||
          distinctSubCategoryNames.includes(keyword)
        ) {
          productKeywords.push(keyword);
        } else {
          otherKeywords.push(keyword);
        }
      });

      if (otherKeywords.length > 0) {
        const keywordRegex = otherKeywords.join("|");

        categoryIds = await Category.find({
          $or: [
            { categoryName: { $regex: `^${keywordRegex}`, $options: "i" } },
            {
              categoryDescription: {
                $regex: `^${keywordRegex}`,
                $options: "i",
              },
            },
          ],
        }).distinct("_id");

        subCategoryIds = await SubCategory.find({
          $or: [
            { subCategoryName: { $regex: `^${keywordRegex}`, $options: "i" } },
            {
              subCategoryDescription: {
                $regex: `^${keywordRegex}`,
                $options: "i",
              },
            },
          ],
        }).distinct("_id");

        filter.$or = [
          { productName: { $regex: `^${keywordRegex}`, $options: "i" } },
          { productDescription: { $regex: `^${keywordRegex}`, $options: "i" } },
          { productBrand: { $regex: `^${keywordRegex}`, $options: "i" } },
          {
            productShortDescription: {
              $regex: `^${keywordRegex}`,
              $options: "i",
            },
          },
          { productFeature: { $regex: `^${keywordRegex}`, $options: "i" } },
          { categoryId: { $in: categoryIds } },
          { subCategoryId: { $in: subCategoryIds } },
        ];
      }

      if (productKeywords.length > 0) {
        const productKeywordRegex = productKeywords.join("|");

        if (!filter.$and) {
          filter.$and = [];
        }
        filter.$and.push({
          productName: { $regex: `^${productKeywordRegex}`, $options: "i" },
        });
      }

      if (attributes.length > 0) {
        attributes.forEach((attribute: any) => {
          if (!filter.$and) {
            filter.$and = [];
          }
          filter.$and.push({
            productDescription: { $regex: attribute, $options: "i" },
          });
        });
      }

      if (priceRange) {
        if (!filter.$and) {
          filter.$and = [];
        }
        filter.$and.push({ productPrice: { $lte: priceRange.max } });
      }
    }

    const totalCount = await Product.countDocuments(filter);
    const allProducts = await Product.find(filter);
    const shuffledProducts = shuffleArray(allProducts);

    if (shuffledProducts.length > 0) {
      return res.json({
        message: SuccessMessages.ProductFoundSuccess,
        status: StatusCodes.Success.Ok,
        success: true,
        data: {
          products: shuffledProducts,
          totalCount,
        },
      });
    } else {
      return res.json({
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
  } catch (error) {
    console.error("Error in getting all products", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Get product by id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const getProduct = await Product.findById(productId);
    if (!getProduct) {
      return res.json({
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    return res.json({
      message: SuccessMessages.ProductFoundSuccess,
      status: StatusCodes.Success.Ok,
      success: true,
      getProduct,
    });
  } catch (error) {
    console.error("Error in getting all products", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Update a product by ID
export const updateProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      productPrice,
      productDescription,
      productStockQuantity,
      productBrand,
      productShortDescription,
      productFeature,
    } = req.body;
    const files = req.files as Express.Multer.File[];
    const product = await Product.findById(productId);

    if (!product) {
      return res.json({
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path)
      );
      const uploadResults = await Promise.all(uploadPromises);
      const secure_urls = uploadResults.map((result) => result.secure_url);
      product.productImg = secure_urls;
    }

    if (productName) product.productName = productName;
    if (productPrice) product.productPrice = productPrice;
    if (productDescription) product.productDescription = productDescription;
    if (productStockQuantity)
      product.productStockQuantity = productStockQuantity;
    if (productBrand) product.productBrand = productBrand;
    if (productShortDescription)
      product.productShortDescription = productShortDescription;
    if (productFeature) product.productFeature = productFeature;

    const updatedProduct = await product.save();

    return res.json({
      message: SuccessMessages.ProductUpdatedSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in updating product", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};

// Delete a product by ID
export const deleteProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.json({
        message: ErrorMessages.ProductNotFound,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      });
    }

    await product.deleteOne();

    return res.json({
      message: SuccessMessages.ProductDeletedSuccess,
      success: true,
      status: StatusCodes.Success.Ok,
    });
  } catch (error) {
    console.error("Error in deleting product", error);
    return res.json({
      message: ErrorMessages.SomethingWentWrong,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    });
  }
};
