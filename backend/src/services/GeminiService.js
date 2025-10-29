const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = "AIzaSyCNsyTGmTQMEph4CK39AyLYb4qI7XEAQU4";
const GEMINI_MODEL = "gemini-2.5-flash"; // latest Gemini model

async function extractTaxData(ocrText) {
  const systemPrompt = `
You are an expert AI tax assistant for the Indian taxation system.

Your tasks:
1. Extract structured tax-relevant information from OCR text (like Form 16, Form 26AS, business receipts, etc.).
2. Identify the correct Income Tax Return (ITR) form type (1 to 7) based on income sources and taxpayer type.
3. Compute total taxable income and tax payable (Old Regime for FY 2024–25).
4. Return strictly valid JSON in the structure below.

### OUTPUT JSON FORMAT
{
  "taxpayer_name": string,
  "pan": string,
  "assessment_year": string,
  "income_sources": {
      "salary": number,
      "house_property": number,
      "business_income": number,
      "capital_gains": number,
      "other_income": number
  },
  "deductions": {
      "80C": number,
      "80D": number,
      "16(ia)": number,
      "others": number
  },
  "tds_total": number,
  "tax_paid": number,
  "computed": {
      "gross": number,
      "totalDeductions": number,
      "taxableIncome": number,
      "taxPayable": number
  },
  "itr_category": string, // must be one of ITR-1 to ITR-7
  "notes": string
}

### ITR SELECTION RULES
Choose the ITR form based on:
- **ITR-1 (Sahaj):** Individual (Resident) having income from Salary, one House Property, and Other Income (Interest, etc.), and total income < ₹50L.
- **ITR-2:** Individual or HUF with income from capital gains, more than one house property, or income > ₹50L.
- **ITR-3:** Individual or HUF with income from business or profession.
- **ITR-4 (Sugam):** Individual, HUF, or Firm (other than LLP) with presumptive business income u/s 44AD, 44ADA, or 44AE.
- **ITR-5:** For partnership firms (LLPs) not covered under ITR-7.
- **ITR-6:** For companies not claiming exemption under section 11.
- **ITR-7:** For persons including companies required to file returns under sections 139(4A) to 139(4F) (trusts, NGOs, etc.).

### COMPUTATION RULES (Old Regime FY 2024–25)
- gross = sum of all income sources
- totalDeductions = sum of all deductions
- taxableIncome = gross - totalDeductions
- Apply slabs (for Individuals):
    * 0 – 2.5L → 0%
    * 2.5L – 5L → 5%
    * 5L – 10L → 20%
    * >10L → 30%
- taxPayable = slab-wise computed + 4% cess (rounded to nearest integer)

Always output clean, parseable JSON (no explanations, no markdown).
`;

  const userPrompt = `
OCR_TEXT_START
${ocrText}
OCR_TEXT_END

Extract, compute, and determine the correct ITR category.
Return ONLY JSON in the specified format.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: userPrompt },
            ],
          },
        ],
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("⚠️ Gemini returned invalid JSON. Returning raw text.");
      return { raw: cleaned };
    }
  } catch (error) {
    console.error("Gemini call failed", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { extractTaxData };
