import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
import prisma from "../config/database";

class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await prisma.product.findMany({
        // where: { shopId: 1 },
        include: {
          product_unit: {
            include: {
              unit: true,
            },
          },
        },
      });
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    const productId = parseInt(req.params.id, 10);

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          product_unit: {
            include: {
              unit: true,
              baseUnit: true,
            },
          },
          category: true,
        },
      });

      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getProductByProductUnitId(req: Request, res: Response): Promise<void> {
    const productUnitId = parseInt(req.params.id, 10);

    try {
      const product_unit = await prisma.product_unit.findUnique({
        where: {
          id: productUnitId,
        },
        include: {
          product: {
            include: {
              product_unit: {
                include: {
                  unit: true,
                },
              },
            },
          },
        },
      });

      if (product_unit) {
        res.status(200).json(product_unit);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getProductByBarcode(req: Request, res: Response): Promise<void> {
    const barcode = req.params.barcode;

    try {
      const product = await prisma.product_unit.findFirst({
        where: { barcode: barcode },
        include: {
          product: {
            include: {
              product_unit: {
                include: {
                  unit: true,
                },
              },
              category: true,
            },
          },
        },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.status(200).json(product.product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getAllProductNamesMapping(req: Request, res: Response): Promise<void> {
    try {
      const products = await prisma.product.findMany({
        include: {
          product_unit: {
            include: {
              unit: true,
            },
          },
        },
      });

      // const resultArray = products.map((product) => {
      //   const measurementUnit = product.measurementUnit
      //     ? ` ${product.measurementUnit}`
      //     : '';
      //   const unitName = product.product_unit?.[0]
      //     ?.unit_product_unit_unitIdTounit?.name
      //     ? ` {${product.product_unit[0].unit_product_unit_unitIdTounit.name}}`
      //     : '';

      //   return `${product.name}${measurementUnit}${unitName}`;
      // });
      // const resultArray = products.map((product) => {
      //   const measurementUnit = product.volume ? ` ${product.volume}` : "";
      //   // const productUnit_id = product.product_unit?.[0]?.id ?? null;
      //   const unitName = product.product_unit?.[0]?.unit?.name
      //     ? ` {${product.product_unit[0].unit.name}}`
      //     : "";

      //   return {
      //     id: product.id,
      //     productName: `${product.name}${measurementUnit}${unitName}`,
      //     // productNames: [
      //     //   product.name && `${product.name}${measurementUnit}${unitName}`,
      //     //   product.name2 && `${product.name2}${measurementUnit}${unitName}`,
      //     // ].filter(Boolean),
      //   };
      //   // const array1 = {
      //   //   id: product.id,
      //   //   ...(product.name && {
      //   //     productNames: `${product.name}${measurementUnit}${unitName}`,
      //   //   }),
      //   // };

      //   // const array2 = {
      //   //   id: product.id,
      //   //   ...(product.name2 && {
      //   //     productNames: `${product.name2}${measurementUnit}${unitName}`,
      //   //   }),
      //   // };

      //   // return [array1, array2];
      // });

      // console.log(resultArray);

      const resultArray = products.flatMap((product) => {
        const volume = product.volume ? ` ${product.volume}` : "";
        const unitName = product.product_unit?.[0]?.unit?.name
          ? ` {${product.product_unit[0].unit.name}}`
          : "";

        const objects = [];

        if (product.name) {
          objects.push({
            id: product.id,
            productName: `${product.name}${volume}${unitName}`,
          });
        }

        if (product.name2) {
          objects.push({
            id: product.id,
            productName: `${product.name2}${volume}${unitName}`,
          });
        }

        return objects;
      });

      res.json(resultArray);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const { barcode, price, name } = req.body;
    let unitId = req.body.unitId;

    try {
      if (!unitId) {
        // Check if default unit "ชิ้น" exists
        const defaultUnit = await prisma.unit.findFirst({
          where: { name: "ชิ้น", shopId: 1 },
        });

        // If default unit "ชิ้น" doesn't exist, create it
        if (!defaultUnit) {
          const newDefaultUnit = await prisma.unit.create({
            data: {
              name: "ชิ้น",
              shopId: 1,
            },
          });

          unitId = newDefaultUnit.id;
        } else {
          unitId = defaultUnit.id;
        }
      }

      const productData = {
        categoryId: 1,
        product_unit: {
          create: [
            {
              barcode,
              price,
              unitId,
              // createdAt: getCurrentDatePrisma(),
              // updatedAt: getCurrentDatePrisma(),
            },
          ],
        },
      };

      // Conditionally include name if it exists
      if (name) {
        Object.assign(productData, { name });
      }

      const newProduct = await prisma.product.create({
        data: productData,
        include: {
          product_unit: true,
        },
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const productId = parseInt(req.params.id, 10);
    const { name, price } = req.body;

    try {
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          name,
          product_unit: {
            update: [price],
          },
        },
        include: {
          product_unit: true,
        },
      });

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async updateProductUnit(req: Request, res: Response): Promise<void> {
    const productUnitId = parseInt(req.params.id, 10);
    const { name, name2, volume, color_appearance, cost, price } = req.body;

    try {
      const updatedProductUnit = await prisma.product_unit.update({
        where: { id: productUnitId },
        data: {
          cost,
          price,
          product: {
            update: { name, name2, volume, color_appearance },
          },
        },
        include: {
          product: {
            include: {
              product_unit: {
                include: {
                  unit: true,
                },
              },
              category: true,
            },
          },
        },
      });

      res.status(200).json(updatedProductUnit.product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const productId = parseInt(req.params.id, 10);

    try {
      await prisma.product.delete({
        where: { id: productId },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default ProductController;
