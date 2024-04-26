import {
  userType,
  CustomRequest,
} from "./../../middleware/jwtToken/authMiddleware";
import Cart from "../models/cartModel";
import Products from "../../admin/models/productModel";
import {
  StatusCodes,
  SuccessMessages,
  ErrorMessages,
} from "../../validation/responseMessages";

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

// Add product to cart
export const addToCart = async (req: CustomRequest) => {
  try {
    const user = req.user as userType;
    if (!user) {
      return { status: 404, message: "User not found" };
    }
    const userId = user.userId;
    const cartData = req.body;
    const productsData = cartData.products;

    if (!Array.isArray(productsData)) {
      return { status: 400, message: "Invalid products data format" };
    }
    const productsPromises = productsData.map(async (productItem) => {
      const { productName, quantity } = productItem;
      const product = await Products.findOne({ productName: productName });
      if (!product) {
        return {
          status: 404,
          message: `Product '${productName}' not found`,
        };
      }
      return {
        productId: product._id,
        quantity: quantity,
        price: product.productPrice,
      };
    });
    const productsResults = await Promise.all(productsPromises);
    const errorProduct = productsResults.find(
      (result) => result.status !== undefined
    );
    if (errorProduct) {
      return errorProduct;
    }
    const products: CartItem[] = productsResults as unknown as CartItem[];
    const totalAmount = products.reduce((acc, product) => {
      return acc + product.price * product.quantity;
    }, 0);
    const newCartItem = {
      buyerUserId: userId,
      products: products,
      totalAmount: totalAmount,
    };
    const savedCartItem = await Cart.create(newCartItem);
    if (savedCartItem.id) {
      return {
        message: SuccessMessages.CartSuccess,
        success: true,
        status: StatusCodes.Success.Created,
        data: savedCartItem,
      };
    } else {
      return {
        message: ErrorMessages.CartError,
        success: false,
        status: StatusCodes.ClientError.NotFound,
      };
    }
  } catch (error) {
    console.error("Error in creating cart", error);
    return {
      message: ErrorMessages.CartError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};

export const getAllCartIteams = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const totalCount = await Cart.countDocuments();
    const allCarts = await Cart.find().skip(skip).limit(limit);
    if (allCarts.length > 0) {
      return {
        message: SuccessMessages.CartFoundSuccess,
        status: StatusCodes.DataFound.Found,
        success: true,
        data: {
          products: allCarts,
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
    return {
      message: ErrorMessages.CartError,
      success: false,
      status: StatusCodes.ServerError.InternalServerError,
    };
  }
};
