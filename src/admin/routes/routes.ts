import express from "express";
import { verifyAuthToken } from "../../middleware/token/authMiddleware";
import multer from "multer";
import bodyParser from "body-parser";
import * as adminController from "../controller/adminContoller";
import * as productController from "../controller/productController";
import * as roleController from "../controller/roleController";
import * as categoryController from "../controller/categoryController";
import * as subCategoryController from "../controller/subCategoryController";

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

// Role routes
adminRouter.post("/create-role", roleController.createRole);

// Admin routes
adminRouter.post("/register", adminController.adminRegister);
adminRouter.get(
  "/get-all-users",
  verifyAuthToken(["admin"]),
  adminController.getAllUsers
);

// Categories routes
adminRouter.post(
  "/create-category",
  verifyAuthToken(["admin"]),
  upload.single("categoryImg"),
  categoryController.createCategory
);
adminRouter.get(
  "/get-all-categories",
  verifyAuthToken(["admin"]),
  categoryController.getAllCategories
);
adminRouter.get(
  "/get-category/:categoryId",
  verifyAuthToken(["admin"]),
  categoryController.getCategoryById
);
adminRouter.patch(
  "/update-category/:categoryId",
  verifyAuthToken(["admin"]),
  upload.single("categoryImg"),
  categoryController.updateCategoryById
);
adminRouter.delete(
  "/delete-category/:categoryId",
  verifyAuthToken(["admin"]),
  categoryController.deleteCategoryById
);

// Sub categories routes
adminRouter.post(
  "/create-sub-category",
  verifyAuthToken(["admin"]),
  upload.single("subCategoryImg"),
  subCategoryController.createSubCategory
);
adminRouter.get(
  "/get-all-sub-categories",
  verifyAuthToken(["admin"]),
  subCategoryController.getAllSubcategories
);
adminRouter.get(
  "/get-sub-category/:subCategoryId",
  verifyAuthToken(["admin"]),
  subCategoryController.getSubcategoriesById
);
adminRouter.patch(
  "/update-sub-category/:subCategoryId",
  verifyAuthToken(["admin"]),
  upload.single("subCategoryImg"),
  subCategoryController.updateSubCategoryById
);
adminRouter.delete(
  "/delete-sub-category/:subCategoryId",
  verifyAuthToken(["admin"]),
  subCategoryController.deleteSubCategoryById
);

// Product routes
adminRouter.post(
  "/create-product",
  verifyAuthToken(["admin"]),
  upload.single("productImg"),
  productController.createProduct
);
adminRouter.get(
  "/get-all-products",
  verifyAuthToken(["admin", "user"]),
  productController.getAllProducts
);
adminRouter.get(
  "/get-product/:productId",
  verifyAuthToken(["admin", "user"]),
  productController.getProductById
);
adminRouter.patch(
  "/update-product/:productId",
  verifyAuthToken(["admin"]),
  upload.single("productImg"),
  productController.updateProductById
);
adminRouter.delete(
  "/delete-product/:productId",
  verifyAuthToken(["admin"]),
  productController.deleteProductById
);

export default adminRouter;
