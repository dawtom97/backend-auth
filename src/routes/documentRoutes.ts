import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import docxConverter from "docx-pdf";

const router = Router();
const templatePath = path.join(process.cwd(), "uploads", "super_faktura.docx");

router.post("/generate-pdf", async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Wypełnianie szablonu DOCX
        const docxBuffer = fs.readFileSync(templatePath);
        const zip = new PizZip(docxBuffer);
        const doc = new Docxtemplater(zip);
        doc.setData(req.body);
        doc.render();

        console.log(req.body)

        const outputDocxPath = path.join(process.cwd(), "output.docx");
        fs.writeFileSync(outputDocxPath, doc.getZip().generate({ type: "nodebuffer" }));

        // 2. Konwersja DOCX do PDF przez docx-pdf (LibreOffice w tle)
        const outputPdfPath = path.join(process.cwd(), "output.pdf");

        docxConverter(outputDocxPath, outputPdfPath, (err: any, result: any) => {
            if (err) {
                console.error("Conversion error:", err);
                return res.status(500).json({ error: "Failed to convert DOCX to PDF" });
            }

            const pdfBuffer = fs.readFileSync(outputPdfPath);
            res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
            res.setHeader("Content-Type", "application/pdf");
            res.end(pdfBuffer);
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error generating PDF" });
    }
});

export default router;

