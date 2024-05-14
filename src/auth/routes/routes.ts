import express from "express";
import { verifyAuthToken } from "../../middleware/token/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";
import * as userController from "../controllers/userController";
import * as pdfService from "../services/pdfDownload";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.get(
  "/get-user",
  verifyAuthToken(["user"]),
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

// Invoice route
authRouter.get(
  "/download-pdf/:paymentId",
  verifyAuthToken(["user"]),
  pdfService.downloadPdfInvoice
);

export default authRouter;
