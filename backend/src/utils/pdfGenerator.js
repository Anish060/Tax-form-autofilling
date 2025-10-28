const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateITRPdf({ taxpayerName, pan, assessmentYear, computedTax, extracted }) {
  const outDir = path.join(__dirname, '..', '..', 'generated');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filename = `ITR-${Date.now()}.pdf`;
  const filePath = path.join(outDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('Income Tax Return - Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${taxpayerName}`);
    doc.text(`PAN: ${pan || 'N/A'}`);
    doc.text(`Assessment Year: ${assessmentYear}`);
    doc.moveDown();

    doc.text('Computed Tax', { underline: true });
    doc.text(`Gross Income: ₹ ${computedTax.gross}`);
    doc.text(`Total Deductions: ₹ ${computedTax.totalDeductions}`);
    doc.text(`Taxable Income: ₹ ${computedTax.taxable}`);
    doc.text(`Tax Payable: ₹ ${computedTax.taxPayable}`);
    doc.moveDown();

    doc.text('Extracted Fields (raw)', { underline: true });
    doc.fontSize(10).text(JSON.stringify(extracted, null, 2));

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = { generateITRPdf };
