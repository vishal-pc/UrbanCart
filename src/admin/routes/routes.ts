import express from "express";
import {
  verifyAuthToken,
  verifyAdminToken,
} from "../../middleware/jwtToken/authMiddleware";
import multer from "multer";
import bodyParser from "body-parser";
import * as adminController from "../controller/adminContoller";
import * as productController from "../controller/productController";

const adminRouter = express.Router();

// Using body-parser middleware
adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for uploading files
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const name = Date.now() + "_" + file.originalname;
    cb(null, name);
  },
});

// Uploading files into storage
const upload = multer({ storage: storage });

// Admin routes
adminRouter.post("/register", adminController.adminRegister);
adminRouter.post("/login", adminController.loginAdmin);

// Product routes
adminRouter.post(
  "/create-product",
  [verifyAuthToken, verifyAdminToken],
  upload.single("productImg"),
  productController.createProduct
);
adminRouter.get(
  "/get-all-products",
  [verifyAuthToken],
  productController.getAllProducts
);

export default adminRouter;
