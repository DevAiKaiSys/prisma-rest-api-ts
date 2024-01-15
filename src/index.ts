import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRoutes from "./routes/productRoutes"; // Import your product routes or any other routes
import invoiceRoutes from "./routes/invoiceRoutes";
import categoriesRoutes from "./routes/categoryRoutes";
import prisma from "./config/database";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes); // Use your product routes or any other routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/categories", categoriesRoutes);

// tester
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/connect", async (req, res) => {
  try {
    await prisma.$connect();
    console.log("Database connection successful!");
    res.send("Database connection successful!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).send("Error connecting to the database");
  } finally {
    await prisma.$disconnect();
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nClosing Prisma Client...");
  await prisma.$disconnect();
  console.log("Prisma Client closed.");
  process.exit();
});
