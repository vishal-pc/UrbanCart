import express from "express";
import { verifyAuthToken } from "../../middleware/token/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";
import * as userController from "../controllers/userController";
import * as pdfController from "../controllers/pdfController";
import * as addressController from "../controllers/addressController";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.get(
  "/get-user",
  verifyAuthToken(["user", "admin"]),
  authController.getUserById
);

// Cart routes
authRouter.post(
  "/add-to-cart",
  verifyAuthToken(["user"]),
  cartController.addToCart
);
authRouter.get(
  "/get-cart",
  verifyAuthToken(["user"]),
  cartController.getAllCartItems
);
authRouter.get(
  "/get-cart-item/:cartId",
  verifyAuthToken(["user"]),
  cartController.getUserCartItemById
);
authRouter.delete(
  "/remove-cart-item/:cartItemId",
  verifyAuthToken(["user"]),
  cartController.removeProductQuantity
);
authRouter.patch(
  "/update-cart-item/:cartId",
  verifyAuthToken(["user"]),
  cartController.updateCartItemQuantity
);
authRouter.delete(
  "/delete-cart-item/:cartId",
  verifyAuthToken(["user"]),
  cartController.deleteCartItem
);

// Address routes
authRouter.post(
  "/add-address",
  verifyAuthToken(["user"]),
  addressController.saveUserAddress
);
authRouter.get(
  "/get-address",
  verifyAuthToken(["user"]),
  addressController.getAllUsersAddress
);
authRouter.get(
  "/get-address/:addressId",
  verifyAuthToken(["user"]),
  addressController.getUserAddressById
);
authRouter.patch(
  "/update-address/:addressId",
  verifyAuthToken(["user"]),
  addressController.updateUserAddress
);
authRouter.delete(
  "/delete-address/:addressId",
  verifyAuthToken(["user"]),
  addressController.deleteUserAddressById
);

// Payment routes
authRouter.post(
  "/process-payment",
  verifyAuthToken(["user"]),
  paymentController.processPayment
);
authRouter.get(
  "/get-payment/:paymentId",
  verifyAuthToken(["user"]),
  paymentController.getPaymentById
);
authRouter.get(
  "/get-payment-details",
  verifyAuthToken(["user"]),
  paymentController.getPaymentDetails
);

// User routes
authRouter.post("/forget-password", userController.forgetPassword);
authRouter.post("/reset-password", userController.resetPassword);
authRouter.patch(
  "/change-password",
  verifyAuthToken(["user", "admin"]),
  userController.changePassword
);
authRouter.get(
  "/get-categories",
  verifyAuthToken(["user"]),
  userController.getCategories
);
authRouter.get(
  "/get-categories/:categoryId",
  verifyAuthToken(["user"]),
  userController.getCategoriesByIdWithSubCategories
);
authRouter.get(
  "/get-sub-categories/:subcategoryId",
  verifyAuthToken(["user"]),
  userController.getSubCategoriesByIdWithProducts
);

// Invoice route
authRouter.get(
  "/download-pdf/:paymentId",
  verifyAuthToken(["user"]),
  pdfController.downloadPdfInvoice
);

export default authRouter;
