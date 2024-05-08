"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middleware/token/authMiddleware");
const authController = __importStar(require("../controllers/authController"));
const cartController = __importStar(require("../controllers/cartController"));
const paymentController = __importStar(require("../controllers/paymentController"));
const userController = __importStar(require("../controllers/userController"));
const authRouter = express_1.default.Router();
// Auth routes
authRouter.post("/register", authController.authRegister);
authRouter.get("/get-user", (0, authMiddleware_1.verifyAuthToken)(["user"]), authController.getUserById);
// Cart routes
authRouter.post("/add-to-cart", (0, authMiddleware_1.verifyAuthToken)(["user"]), cartController.addToCart);
authRouter.get("/get-cart", (0, authMiddleware_1.verifyAuthToken)(["user"]), cartController.getAllCartItems);
authRouter.get("/get-cart-item/:cartId", (0, authMiddleware_1.verifyAuthToken)(["user"]), cartController.getUserCartItemById);
authRouter.delete("/remove-cart-item/:cartItemId", (0, authMiddleware_1.verifyAuthToken)(["user"]), cartController.removeProductQuantity);
// Payment routes
authRouter.post("/process-payment", (0, authMiddleware_1.verifyAuthToken)(["user"]), paymentController.processPayment);
authRouter.get("/get-payment/:paymentId", (0, authMiddleware_1.verifyAuthToken)(["user"]), paymentController.getPaymentById);
// User routes
authRouter.post("/forget-password", userController.forgetPassword);
authRouter.post("/reset-password", userController.resetPassword);
exports.default = authRouter;
