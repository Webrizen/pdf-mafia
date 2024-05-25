const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/merge-pdfs', upload.array('pdfs', 2), async (req, res) => {
  try {
    const pdfs = req.files.map(file => file.path);
    const mergedPdfBytes = await mergePDFs(pdfs);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(mergedPdfBytes);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    res.status(500).send('Error merging PDFs');
  }
});

async function mergePDFs(pdfPaths) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
}

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});