import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PrismaDevClient from "../config/database";

const prisma: PrismaClient =
  process.env.NODE_ENV === "production" ? new PrismaClient() : PrismaDevClient;

class CategoryController {
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categorys = await prisma.category.findMany({
        where: { shopId: 1 },
      });
      res.status(200).json(categorys);
    } catch (error) {
      console.error("Error fetching categorys:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    try {
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (category) {
        res.status(200).json(category);
      } else {
        res.status(404).json({ error: "Category not found" });
      }
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    const { name } = req.body;
    const shopId = 1;

    try {
      const existingCategory = await prisma.category.findFirst({
        where: {
          shopId,
          parentId: null,
        },
      });

      const defaultCategory = existingCategory
        ? existingCategory
        : await prisma.category.create({
            data: {
              shop: {
                connectOrCreate: {
                  create: {
                    id: shopId,
                    name: "YourShopName",
                  },
                  where: {
                    id: shopId,
                  },
                },
              },
              name: "หมวดหมู่เริ่มต้น",
            },
          });

      const newCategory = await prisma.category.create({
        data: {
          // shop: {
          //   connect: {
          //     id: shopId,
          //   },
          // },
          // parent: {
          //   connect: {
          //     id: defaultCategory.id,
          //   },
          // },
          shopId,
          parentId: defaultCategory.id,
          name: name || "หมวดหมู่ใหม่",
        },
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    const { name, name2, type, note } = req.body;

    try {
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name, name2, type /* note */ },
      });

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    try {
      await prisma.category.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default CategoryController;
