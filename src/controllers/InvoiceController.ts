import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import PrismaDevClient from "../config/database";

const prisma: PrismaClient =
  process.env.NODE_ENV === "production" ? new PrismaClient() : PrismaDevClient;

class InvoiceController {
  async getAllInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await prisma.invoice.findMany({
        orderBy: [
          {
            issuedAt: "desc",
          },
        ],
        include: {
          invoice_item: true,
          payment: true,
        },
      });
      res.status(200).json(invoices);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getInvoiceByDate(req: Request, res: Response): Promise<void> {
    const date = req.params.date;
    const date_start = new Date(date);
    const date_end = new Date(date);
    date_end.setDate(date_end.getDate() + 1);

    // offset according TIMEZONE
    date_start.setHours(date_start.getHours() - 7);
    date_end.setHours(date_end.getHours() - 7);

    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          issuedAt: {
            gte: date_start, // Start of date range
            lte: date_end, // End of date range
          },
        },
        orderBy: [
          {
            issuedAt: "desc",
          },
        ],
        include: {
          invoice_item: true,
          payment: true,
        },
      });

      res.status(200).json(invoices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createInvoice(req: Request, res: Response): Promise<void> {
    const { invoice, invoice_items, payment } = req.body;

    try {
      const shopId = 1;
      // Generate a unique invoice number based on shopId
      const invoiceNumber = await generateInvoiceNumber(shopId);

      // // Start a Prisma transaction
      // let transaction = await prisma.$transaction([
      //   // Create the invoice with included invoice items and payment
      //   prisma.invoice.create({
      //     data: {
      //       ...invoice,
      //       shopId,
      //       isPaid: true,
      //       invoiceNumber,
      //       issuedAt: getCurrentDatePrisma(),
      //       // Include related records in the create operation
      //       invoice_item: {
      //         createMany: {
      //           data: invoice_items.map((item: any) => ({
      //             ...item,
      //             order: undefined,
      //           })),
      //         },
      //       },
      //       payment: {
      //         create: {
      //           ...payment,
      //         },
      //       },
      //     },
      //     // Specify what to include in the response
      //     include: {
      //       invoice_item: true,
      //       payment: true,
      //     },
      //   }),
      // ]);

      // const [newInvoice] = transaction;

      // console.log("New Invoice with included items and payment:", newInvoice);

      // console.log("Transaction completed successfully.");

      await prisma.invoice.create({
        data: {
          ...invoice,
          shopId,
          isPaid: true,
          invoiceNumber,
          // issuedAt: getCurrentDatePrisma(),
          invoice_item: {
            createMany: {
              data: invoice_items.map((item: any) => ({
                ...item,
              })),
            },
          },
          payment: {
            create: {
              ...payment,
            },
          },
        },
      });

      res.status(201).json({ message: "success" });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

// Function to generate a unique invoice number based on shopId
async function generateInvoiceNumber(shopId: number): Promise<string> {
  try {
    // You can implement your own logic to generate a unique invoice number
    // For example, you might want to query the database to find the last invoice number for the shop
    // and then increment it.

    // For simplicity, here's a basic example:
    const lastInvoice = await prisma.invoice.findFirst({
      where: { shopId },
      orderBy: { issuedAt: "desc" },
    });

    let lastInvoiceNumber: number = 0;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split("-");
      // Extract the last part and convert it to a number
      lastInvoiceNumber = parseInt(parts[parts.length - 1], 10) || 0;
    }

    const newInvoiceNumber = lastInvoiceNumber + 1;

    // Format the new invoice number with leading zeros
    const formattedShopId = shopId.toString().padStart(5, "0");
    const formattedInvoiceNumber = newInvoiceNumber.toString().padStart(9, "0");

    return `INV-${formattedShopId}-${formattedInvoiceNumber}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    throw new Error("Error generating invoice number");
  }
}

export default InvoiceController;
