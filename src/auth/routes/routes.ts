import express from "express";
import { verifyAuthToken } from "../../middleware/jwtToken/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";
import * as userController from "../controllers/userController";

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
  cartController.getAllCartIteams
);
authRouter.get(
  "/get-cart-item/:cartId",
  verifyAuthToken(["user"]),
  cartController.getUserCartItemById
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

// User routes
authRouter.post("/forget-password", userController.forgetPassword);
authRouter.post("/reset-password", userController.resetPassword);

export default authRouter;
