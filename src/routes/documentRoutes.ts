import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import mammoth from "mammoth";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const router = Router();
const templatePath = path.join(process.cwd() ,"uploads", "invoice.docx");

router.post("/generate-pdf", async (req: Request, res: Response): Promise<void> => {
    try {
        const docxBuffer = fs.readFileSync(templatePath);
    
        const zip = new PizZip(docxBuffer);
        const doc = new Docxtemplater(zip);
        
        const variables = req.body;
        doc.setData(variables);
        doc.render();
        
        const updatedDocxBuffer = doc.getZip().generate({ type: "nodebuffer" });
        
        const { value: htmlContent } = await mammoth.convertToHtml({ buffer: updatedDocxBuffer });
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "load" });
        const pdfBuffer = await page.pdf({ format: "A4" })
        // zapis lokalny
        // const pdfPath = path.join(process.cwd(), "generated-document.pdf");
        // const pdfBuffer = await page.pdf({ format: "A4" });
        // fs.writeFileSync(pdfPath, pdfBuffer);
        // const pdfBuffer = await page.pdf({ format: "A4" });
        await browser.close();
        
        res.setHeader("Content-Disposition", "attachment; filename=document.pdf");
        res.setHeader("Content-Type", "application/pdf");
        res.end(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generating PDF" });
    }
});

export default router;