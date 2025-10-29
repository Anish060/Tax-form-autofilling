const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const { Document, TaxReturn, User } = require('../models');
const pdfGen = require('../utils/pdfGenerator');

router.get('/document/:id', async (req, res) => {
  const doc = await Document.findByPk(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true, doc });
});

router.post('/generate', async (req, res) => {
  const { documentId, assessmentYear, regime, userId } = req.body;
  try {
    const doc = await Document.findByPk(documentId);
    if (!doc) return res.status(404).json({ error: 'doc not found' });

    // ✅ Parse extracted JSON safely
    let ext = doc.extractedJson || {};
    if (typeof ext === "string") {
      try {
        ext = JSON.parse(ext);
      } catch (e) {
        console.warn("Failed to parse extractedJson:", e);
        ext = {};
      }
    }

    // Naive tax computation
    const salary = ext.salary_income || 0;
    const other = ext.other_income || 0;
    const deductions = ext.deductions || {};
    const totalDeductions = Object.values(deductions).reduce((a,b)=>a+(Number(b)||0),0);
    const gross = Number(salary) + Number(other);
    const taxable = Math.max(0, gross - totalDeductions);

    // Actual Indian Income Tax computation (Old Regime - FY 2024-25)
const computeTax = (income) => {
  let tax = 0;

  if (income <= 250000) {
    tax = 0; // No tax for income up to ₹2.5L
  } 
  else if (income <= 500000) {
    tax = (income - 250000) * 0.05; // 5% for 2.5L–5L
  } 
  else if (income <= 1000000) {
    tax = (250000 * 0.05) + (income - 500000) * 0.2; // 5% on next 2.5L, 20% on rest
  } 
  else {
    tax = (250000 * 0.05) + (500000 * 0.2) + (income - 1000000) * 0.3; // 5% + 20% + 30%
  }

  // ✅ Rebate under Section 87A (for income up to ₹5L)
  if (income <= 500000) {
    tax = 0;
  }

  // ✅ Add Health & Education Cess (4%)
  const cess = tax * 0.04;

  // ✅ Total tax rounded to nearest integer
  return Math.round(tax + cess);
};


    const computedTax = {
      gross,
      totalDeductions,
      taxable,
      taxPayable: computeTax(taxable)
    };

    // ✅ Generate PDF using parsed data
    const pdfPath = await pdfGen.generateITRPdf({
      taxpayerName: ext.taxpayer_name || 'Unknown',
      pan: ext.pan || null,
      assessmentYear,
      computedTax,
      extracted: ext
    });

    // ✅ Save TaxReturn entry
    const taxReturn = await TaxReturn.create({
      assessmentYear,
      regime,
      computedTax,
      itrJson: { taxpayer: ext, computed: computedTax },
      pdfPath,
      DocumentId: doc.id,
      UserId: userId || null
    });

    res.json({ ok: true, taxReturn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.get('/download/:id', async (req, res) => {
  try {
    const taxReturn = await TaxReturn.findByPk(req.params.id);
    if (!taxReturn) return res.status(404).json({ error: 'Tax return not found' });

    const pdfPath = taxReturn.pdfPath;
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${path.basename(pdfPath)}`);
    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    console.error("❌ Error sending PDF:", err);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
});

module.exports = router;

module.exports = router;
