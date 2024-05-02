import express from "express";
import { verifyAuthToken } from "../../middleware/jwtToken/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";
import * as userController from "../controllers/userController";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.post("/login", authController.authLogin);
authRouter.get("/get-user", [verifyAuthToken], authController.getUserById);

// Cart routes
authRouter.post("/add-to-cart", [verifyAuthToken], cartController.addToCart);
authRouter.get("/get-cart", [verifyAuthToken], cartController.getAllCartIteams);

// Payment routes
authRouter.post(
  "/process-payment",
  [verifyAuthToken],
  paymentController.processPayment
);

// User routes
authRouter.post("/forget-password", userController.forgetPassword);
authRouter.post("/reset-password", userController.resetPassword);

export default authRouter;
