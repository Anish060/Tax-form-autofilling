// src/services/ocrService.js
const tesseract = require('node-tesseract-ocr');
const pdfPoppler = require('pdf-poppler');
const fs = require('fs');
const path = require('path');

const config = {
  lang: 'eng',
  oem: 1,
  psm: 3,
};

async function convertPdfToImages(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, path.extname(pdfPath));
  const outputPath = path.join(outputDir, baseName);

  const opts = {
    format: 'png',
    out_dir: outputDir,
    out_prefix: baseName,
    page: null, // converts all pages
  };

  await pdfPoppler.convert(pdfPath, opts);

  // Get all generated PNG files (page-1.png, page-2.png, etc.)
  const images = fs
    .readdirSync(outputDir)
    .filter((f) => f.startsWith(baseName) && f.endsWith('.png'))
    .map((f) => path.join(outputDir, f));

  return images;
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let finalText = '';

  try {
    if (ext === '.pdf') {
      console.log('📄 Converting PDF to images...');
      const imagePaths = await convertPdfToImages(filePath);
      console.log(`✅ Converted ${imagePaths.length} pages`);

      for (const img of imagePaths) {
        const text = await tesseract.recognize(img, config);
        finalText += '\n' + text;
        // optional cleanup
        fs.unlinkSync(img);
      }
    } else {
      console.log('🖼️ Running OCR on image...');
      finalText = await tesseract.recognize(filePath, config);
    }

    return finalText.trim();
  } catch (err) {
    console.error('❌ OCR error', err);
    throw err;
  }
}

module.exports = { extractText };
