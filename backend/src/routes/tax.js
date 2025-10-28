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
  // body: { documentId, assessmentYear, regime, userId }
  const { documentId, assessmentYear, regime, userId } = req.body;
  try {
    const doc = await Document.findByPk(documentId);
    if (!doc) return res.status(404).json({ error: 'doc not found' });

    // naive tax computation (demo): use extracted fields
    const ext = doc.extractedJson || {};
    const salary = ext.salary_income || 0;
    const other = ext.other_income || 0;
    const deductions = ext.deductions || {};
    const totalDeductions = Object.values(deductions).reduce((a,b)=>a+(Number(b)||0),0);
    const gross = Number(salary || 0) + Number(other || 0);
    const taxable = Math.max(0, gross - totalDeductions);

    // simplistic slab computation (example only) - you would implement full Indian slab logic
    const computeTax = (income) => {
      // replace with actual slab logic for the assessment year & regime
      let tax = 0;
      if (income <= 250000) tax = 0;
      else if (income <= 500000) tax = (income - 250000) * 0.05;
      else if (income <= 1000000) tax = 2500 + (income - 500000) * 0.2;
      else tax = 1e4 + (income - 1000000) * 0.3;
      const cess = tax * 0.04;
      return Math.round(tax + cess);
    };

    const computedTax = {
      gross,
      totalDeductions,
      taxable,
      taxPayable: computeTax(taxable)
    };

    // generate PDF
    const pdfPath = await pdfGen.generateITRPdf({
      taxpayerName: ext.taxpayer_name || 'Unknown',
      pan: ext.pan || null,
      assessmentYear,
      computedTax,
      extracted: ext
    });

    // store tax return
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

module.exports = router;
