const express = require('express');
const router = express.Router();
const { Document } = require('../models');
const geminiService = require('../services/geminiService');

router.post('/rerun/:id', async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'doc not found' });
    const extracted = await geminiService.extractTaxData(doc.ocrText);
    doc.extractedJson = extracted;
    await doc.save();
    res.json({ ok: true, doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
