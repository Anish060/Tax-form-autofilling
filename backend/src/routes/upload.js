const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document } = require('../models');
const ocrService = require('../services/ocrService');
const geminiService = require('../services/geminiService');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('doc'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    console.log(`📄 Uploaded file: ${file.originalname}`);

    // 1️⃣ Extract text from the uploaded document (OCR)
    const ocrText = await ocrService.extractText(file.path);
    console.log('✅ OCR extraction completed.');

    // 2️⃣ Call Gemini API to extract structured tax data
    const extracted = await geminiService.extractTaxData(ocrText);
    console.log('✅ Gemini structured extraction completed.');

    // Handle fallback if Gemini returned invalid JSON (with raw text)
    const structuredData = extracted.raw ? {} : extracted;

    // 3️⃣ Store document details + extracted data in DB
    const doc = await Document.create({
      filename: file.originalname,
      filepath: file.path,
      ocrText,
      extractedJson: structuredData // ✅ Store as proper JSON object
    });

    // 4️⃣ Return response
    res.json({
      ok: true,
      message: 'Document processed successfully.',
      doc
    });

  } catch (err) {
    console.error('❌ Upload processing failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
