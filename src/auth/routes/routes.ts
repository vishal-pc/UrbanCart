import express from "express";
import { verifyAuthToken } from "../../middleware/jwtToken/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.post("/login", authController.authLogin);

// Cart routes
authRouter.post("/add-to-cart", [verifyAuthToken], cartController.addToCart);
authRouter.get("/get-cart", [verifyAuthToken], cartController.getAllCartIteams);

// Payment routes
authRouter.post(
  "/process-payment",
  [verifyAuthToken],
  paymentController.processPayment
);

export default authRouter;
