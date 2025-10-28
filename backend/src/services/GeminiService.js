const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: "AIzaSyCNsyTGmTQMEph4CK39AyLYb4qI7XEAQU4",
  baseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
});

/**
 * Use the LLM to parse OCR text to structured tax JSON.
 * We'll provide the model a "function schema" instruction in the prompt:
 */
async function extractTaxData(ocrText) {
  // prompt instructing the model exactly how to output JSON
  const system = `You are an assistant that extracts tax-relevant structured fields from OCR'd financial documents (Form16, bank statements, investment proofs). Output strictly valid JSON containing keys: taxpayer_name, pan, assessment_year, salary_income, allowances, deductions (as object keyed by section and value), tds_total, tax_paid, other_income, notes. If something is missing, set value to null. Be conservative and try to infer where possible.`;

  const user = `OCR_TEXT_START\n${ocrText}\nOCR_TEXT_END\nParse the most likely structured tax fields. Only return JSON.`;

  // Use chat/completions style or responses API depending on client version:
  try {
    // We'll use responses.create (modern OpenAI SDK) if available:
    const resp = await client.chat.completions.create({
      model: 'gemini-1.5-mini', // pick an available Gemini model; change as needed
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      max_tokens: 1200,
      temperature: 0
    });

    // The exact path to text depends on client version
    const text = resp.choices?.[0]?.message?.content ?? resp.choices?.[0]?.text ?? resp.choices?.[0]?.delta?.content;
    // try to robustly parse JSON from returned string
    let jsonText = text;
    try {
      // sometimes model returns code fences — strip them
      jsonText = jsonText.replace(/^[\s\n]*```(?:json)?/i, '').replace(/```[\s\n]*$/i, '').trim();
      const parsed = JSON.parse(jsonText);
      return parsed;
    } catch (parseErr) {
      // fallback: ask the model again or return raw text
      console.error('Failed to parse JSON from Gemini output', parseErr);
      return { raw: text };
    }
  } catch (err) {
    console.error('Gemini call failed', err);
    throw err;
  }
}

module.exports = { extractTaxData };
