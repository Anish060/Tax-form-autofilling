const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY ="AIzaSyCNsyTGmTQMEph4CK39AyLYb4qI7XEAQU4";
const GEMINI_MODEL = "gemini-2.5-flash"; // use the model you want

async function extractTaxData(ocrText) {
  const systemPrompt = `You are an assistant that extracts tax-relevant structured fields from OCR'd financial documents (Form16, bank statements, investment proofs). Output strictly valid JSON containing keys: taxpayer_name, pan, assessment_year, salary_income, allowances, deductions (as object keyed by section and value), tds_total, tax_paid, other_income, notes. If something is missing, set value to null.`;

  const userPrompt = `OCR_TEXT_START\n${ocrText}\nOCR_TEXT_END\nParse the most likely structured tax fields. Only return JSON.`;

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

    // Try parsing JSON
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      console.warn("⚠️ Gemini returned invalid JSON, returning raw text.");
      return { raw: text };
    }
  } catch (error) {
    console.error("Gemini call failed", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { extractTaxData };
