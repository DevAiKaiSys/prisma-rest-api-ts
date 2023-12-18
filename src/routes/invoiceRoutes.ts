import express, { Router } from "express";
import InvoiceController from "../controllers/InvoiceController";

const router: Router = express.Router();
const invoiceController = new InvoiceController();

// GET /api/invoices
router.get("/", invoiceController.getAllInvoices);

// GET /api/invoices/:id
// router.get('/:id', invoiceController.getInvoiceById);

// GET /api/invoices/date/:date
router.get("/date/:date", invoiceController.getInvoiceByDate);

// POST /api/invoices
router.post("/", invoiceController.createInvoice);

// PUT /api/invoices/:id
// router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/invoices/:id
// router.delete('/:id', invoiceController.deleteInvoice);

export default router;
