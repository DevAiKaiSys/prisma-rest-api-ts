import express, { Router } from "express";
import CategoryController from "../controllers/CategoryController";

const router: Router = express.Router();
const categoryController = new CategoryController();

// GET /api/categories
router.get("/", categoryController.getAllCategories);

// GET /api/categories/:id
router.get("/:id", categoryController.getCategoryById);

// POST /api/categories
router.post("/", categoryController.createCategory);

// PUT /api/categories/:id
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", categoryController.deleteCategory);

export default router;
