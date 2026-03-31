/**
 * fileParser.js
 * Extracts plain text from PDF, DOCX, and TXT files
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parse uploaded file buffer into plain text
 * @param {Buffer} buffer - file buffer
 * @param {string} mimetype - file MIME type
 * @param {string} originalname - original filename
 * @returns {Promise<string>} extracted text
 */
async function extractText(buffer, mimetype, originalname) {
  const ext = originalname.split('.').pop().toLowerCase();

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (mimetype === 'application/pdf' || ext === 'pdf') {
    try {
      const data = await pdfParse(buffer);
      return cleanText(data.text);
    } catch (err) {
      throw new Error(`Failed to parse PDF: ${err.message}`);
    }
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return cleanText(result.value);
    } catch (err) {
      throw new Error(`Failed to parse DOCX: ${err.message}`);
    }
  }

  // ── TXT / Plain Text ──────────────────────────────────────────────────────
  if (mimetype === 'text/plain' || ext === 'txt') {
    return cleanText(buffer.toString('utf-8'));
  }

  throw new Error(`Unsupported file type: ${ext}. Please upload PDF, DOCX, or TXT.`);
}

/**
 * Remove excessive whitespace and normalize text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')         // normalize line endings
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')             // tabs to spaces
    .replace(/ {2,}/g, ' ')          // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')      // max 2 consecutive newlines
    .trim();
}

module.exports = { extractText };
