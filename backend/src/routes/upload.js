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
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/', upload.single('doc'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file' });

    // 1) run OCR
    const ocrText = await ocrService.extractText(file.path);

    // 2) call Gemini to extract structured tax data
    const extracted = await geminiService.extractTaxData(ocrText);

    // 3) store in DB
    const doc = await Document.create({
      filename: file.originalname,
      filepath: file.path,
      ocrText,
      extractedJson: extracted
    });

    res.json({ ok: true, doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
