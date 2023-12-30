import express, { Router } from "express";
import ProductController from "../controllers/ProductController";

const router: Router = express.Router();
const productController = new ProductController();

// GET /api/products
router.get("/", productController.getAllProducts);

// GET /api/products/:id
router.get("/:id", productController.getProductById);

// GET /api/products/productunit/:id
router.get("/productunit/:id", productController.getProductByProductUnitId);

// GET /api/products/barcode/:barcode
router.get("/barcode/:barcode", productController.getProductByBarcode);

// GET /api/mapping/productId-name
router.get(
  "/mapping/productId-name",
  productController.getAllProductNamesMapping
);

// POST /api/products
router.post("/", productController.createProduct);

// PUT /api/products/:id
router.put("/:id", productController.updateProduct);

// PUT /api/products/:id
router.put("/productunit/:id", productController.updateProductUnit);

// DELETE /api/products/:id
router.delete("/:id", productController.deleteProduct);

export default router;
