import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await prisma.product.findMany();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
            },
          },
          category: true,
        },
      });

      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.status(200).json(product.product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
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
      const resultArray = products.map((product) => {
        const measurementUnit = product.measurementUnit
          ? ` ${product.measurementUnit}`
          : '';
        // const productUnit_id = product.product_unit?.[0]?.id ?? null;
        const unitName = product.product_unit?.[0]?.unit?.name
          ? ` {${product.product_unit[0].unit.name}}`
          : '';

        return {
          id: product.id,
          productName: `${product.name}${measurementUnit}${unitName}`,
        };
      });

      res.json(resultArray);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    const { barcode, price, name } = req.body;
    let unitId = req.body.unitId;

    try {
      if (!unitId) {
        // Check if default unit "Psc" exists
        const defaultUnit = await prisma.unit.findFirst({
          where: { name: 'Psc', shopId: 1 },
        });

        // If default unit "Psc" doesn't exist, create it
        if (!defaultUnit) {
          const newDefaultUnit = await prisma.unit.create({
            data: {
              name: 'Psc',
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
          create: [{ barcode, price, unitId }],
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
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default ProductController;
