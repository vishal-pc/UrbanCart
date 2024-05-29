import express from "express";
import { verifyAuthToken } from "../../middleware/token/authMiddleware";
import multer from "multer";
import * as adminController from "../controller/adminContoller";
import * as productController from "../controller/productController";
import * as roleController from "../controller/roleController";
import * as categoryController from "../controller/categoryController";
import * as subCategoryController from "../controller/subCategoryController";

const adminRouter = express.Router();

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
adminRouter.post("/register", adminController.registerAdmin);
adminRouter.get(
  "/get-all-users",
  verifyAuthToken(["admin"]),
  adminController.getAllUsers
);
adminRouter.get(
  "/get-all-payments",
  verifyAuthToken(["admin"]),
  adminController.getTotalOrderDetails
);
adminRouter.get(
  "/get-total-revenue",
  verifyAuthToken(["admin"]),
  adminController.getTotalNumberOfOrderPaymentsDetails
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
  upload.array("productImg", 5),
  productController.createProduct
);
adminRouter.get("/get-all-products", productController.getAllProducts);
adminRouter.get("/get-product/:productId", productController.getProductById);
adminRouter.patch(
  "/update-product/:productId",
  verifyAuthToken(["admin"]),
  upload.array("productImg", 5),
  productController.updateProductById
);
adminRouter.delete(
  "/delete-product/:productId",
  verifyAuthToken(["admin"]),
  productController.deleteProductById
);

export default adminRouter;
