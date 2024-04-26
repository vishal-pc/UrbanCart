import express from "express";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import { verifyAuthToken } from "../../middleware/jwtToken/authMiddleware";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.post("/login", authController.authLogin);

// Cart routes
authRouter.post("/add-to-cart", [verifyAuthToken], cartController.addToCart);
authRouter.get("/get-cart", [verifyAuthToken], cartController.getAllCartIteams);
export default authRouter;
