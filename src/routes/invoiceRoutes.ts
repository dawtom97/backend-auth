import { Request, Response, Router } from "express";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import { JwtPayload } from "jsonwebtoken";
import { InvoiceModel } from "../models/InvoiceModel";
import mongoose from "mongoose";

const router = Router();

router.post(
  "/create-invoice",
  authMiddleware,
  async (req: AuthRequest | any, res: Response): Promise<any> => {
    try {
      const invoice = req.body;
      const userId = req.user._id;
      invoice.userId = userId;

      const newInvoice = new InvoiceModel(invoice);
      await newInvoice.save();

      return res.status(201).json({
        message: "Utworzono fakturę",
        data: invoice.title,
      });
    } catch (error) {
      res.status(500).json({
        message: "Błąd podczas tworzenia faktury",
        error,
      });
    }
  }
);

router.get(
  "/find-all",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const existingInvoices = await InvoiceModel.find({});
      if (existingInvoices) {
        return res.json({
          message: "Wyświetl wykaz faktur",
          data: existingInvoices,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Błąd serwera",
        error,
      });
    }
  }
);

router.get(
  "/single-invoice",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const params = req.query;
      const parsedId = new mongoose.Types.ObjectId(params.invoice as string);
      const invoice = await InvoiceModel.findOne({ _id: parsedId });

      res.status(200).json({
        message: "Pobrano informacje o fakturze",
        data: invoice,
      });
    } catch (error) {
      res.status(500).json({
        message: "Błąd serwera",
        error,
      });
    }
  }
);

router.get(
  "/invoices-by-user",
  authMiddleware,
  async (req: AuthRequest | any, res: Response): Promise<any> => {
    try {
      const idFromToken = req.user._id;
      const userId = new mongoose.Types.ObjectId(idFromToken);
      const invoices = await InvoiceModel.find({ userId });

      return res.status(200).json({
        message: "Faktury użytkownika",
        data: invoices,
      });
    } catch (error) {
      res.status(500).json({
        message: "Błąd serwera - faktury",
        error,
      });
    }
  }
);

router.delete('/delete-invoice', authMiddleware, async (req: Request, res: Response): Promise<any> => {
    try {
        const params = req.query
        const parsedId = new mongoose.Types.ObjectId(params.id as string)
        
        const invoice = await InvoiceModel.findOne({ _id: parsedId })
        
        if (!invoice) {
            return res.status(404).json({
                message: 'Faktura o podanym id nie istnieje',
                success:"error"
            })
        }
        
        await InvoiceModel.deleteOne({ _id: parsedId })
        
        return res.status(200).json({
            message: 'Usunięto fakturę',
            data: parsedId,
            status:"success"
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Błąd serwera',
            error,
            status:"error"
        })
    }
})


export default router;
