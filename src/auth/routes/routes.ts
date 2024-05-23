import express from "express";
import multer from "multer";
import { verifyAuthToken } from "../../middleware/token/authMiddleware";
import * as authController from "../controllers/authController";
import * as cartController from "../controllers/cartController";
import * as paymentController from "../controllers/paymentController";
import * as userController from "../controllers/userController";
import * as pdfController from "../controllers/pdfController";
import * as addressController from "../controllers/addressController";
import * as wishlistController from "../controllers/wishlistController";

const authRouter = express.Router();

// Configure multer for uploading files
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const name = Date.now() + "_" + file.originalname;
    cb(null, name);
  },
});

// Uploading files into storage
const upload = multer({ storage: storage });

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
authRouter.patch(
  "/update-profile",
  verifyAuthToken(["user", "admin"]),
  upload.single("profileImg"),
  userController.updateUserProfile
);
authRouter.get("/get-categories", userController.getCategories);
authRouter.get(
  "/get-categories/:categoryId",
  userController.getCategoriesByIdWithSubCategories
);
authRouter.get(
  "/get-sub-categories/:subcategoryId",
  userController.getSubCategoriesByIdWithProducts
);

// Invoice route
authRouter.get(
  "/download-pdf/:paymentId",
  verifyAuthToken(["user"]),
  pdfController.downloadPdfInvoice
);

// Wishlist routes
authRouter.post(
  "/add-to-wishlist",
  verifyAuthToken(["user"]),
  wishlistController.addToWishlist
);
authRouter.get(
  "/get-user-wishlist",
  verifyAuthToken(["user"]),
  wishlistController.getUserWishlist
);
authRouter.delete(
  "/remove-wishlist/:wishlistId",
  verifyAuthToken(["user"]),
  wishlistController.deleteUserWishlist
);

export default authRouter;
