/**
 * documentGenerator.js
 * Generates downloadable PDF and DOCX files from optimized resume text
 */

const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Parse resume text into sections
 * Detects common section headers and splits content
 */
function parseResumeIntoSections(resumeText) {
  const sectionHeaders = [
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE',
    'PROJECTS', 'KEY PROJECTS',
    'EDUCATION', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'AWARDS',
    'LANGUAGES',
  ];

  const lines = resumeText.split('\n');
  const sections = [];
  let currentSection = null;
  let headerLines = [];

  // First few lines are usually name/contact info
  let inHeader = true;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const upperLine = trimmed.toUpperCase().replace(/[^A-Z\s]/g, '');
    const isHeader = sectionHeaders.some(h => upperLine === h || upperLine.startsWith(h));

    if (inHeader && !isHeader) {
      headerLines.push(trimmed);
      // After 4 header lines, stop treating as header
      if (headerLines.length >= 4) inHeader = false;
      continue;
    }

    if (isHeader) {
      inHeader = false;
      if (currentSection) sections.push(currentSection);
      currentSection = { title: trimmed, lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(trimmed);
    } else {
      headerLines.push(trimmed);
    }
  }

  if (currentSection) sections.push(currentSection);

  return { headerLines, sections };
}

/**
 * Generate a DOCX file from resume text
 */
async function generateDOCX(resumeText, filename) {
  const { headerLines, sections } = parseResumeIntoSections(resumeText);
  const children = [];

  // ── Name / Contact header ────────────────────────────────────────────────
  if (headerLines.length > 0) {
    // First line = name (large)
    children.push(
      new Paragraph({
        children: [new TextRun({ text: headerLines[0], bold: true, size: 32, font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
    // Remaining header lines = contact info
    for (let i = 1; i < headerLines.length; i++) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: headerLines[i], size: 20, color: '555555', font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
        })
      );
    }
    // Horizontal rule
    children.push(
      new Paragraph({
        border: { bottom: { color: '2563EB', space: 1, style: BorderStyle.SINGLE, size: 6 } },
        spacing: { after: 200 },
      })
    );
  }

  // ── Sections ──────────────────────────────────────────────────────────────
  for (const section of sections) {
    // Section heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 22,
            color: '1E40AF',
            font: 'Calibri',
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        border: { bottom: { color: 'BFDBFE', space: 1, style: BorderStyle.SINGLE, size: 4 } },
        spacing: { before: 240, after: 120 },
      })
    );

    // Section content lines
    for (const line of section.lines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const text = isBullet ? line.replace(/^[•\-\*]\s*/, '') : line;

      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 20, font: 'Calibri' })],
          bullet: isBullet ? { level: 0 } : undefined,
          spacing: { after: 80 },
        })
      );
    }
  }

  // Build document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children,
    }],
  });

  const filePath = path.join(TEMP_DIR, filename);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * Generate a simple HTML-based PDF using a formatted HTML string
 * Returns the HTML content (used by frontend to print-to-PDF or display)
 */
function generateResumeHTML(resumeText) {
  const { headerLines, sections } = parseResumeIntoSections(resumeText);

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Calibri', 'Georgia', serif; font-size: 11pt; color: #1a1a1a; padding: 40px 50px; max-width: 800px; margin: 0 auto; }
  .name { font-size: 22pt; font-weight: 700; text-align: center; color: #1e3a8a; margin-bottom: 4px; }
  .contact { text-align: center; font-size: 9.5pt; color: #555; margin-bottom: 14px; line-height: 1.6; }
  .divider { border: none; border-bottom: 2px solid #2563eb; margin-bottom: 18px; }
  .section-title { font-size: 11.5pt; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #bfdbfe; padding-bottom: 3px; margin: 16px 0 8px; }
  .line { font-size: 10.5pt; margin: 3px 0; line-height: 1.55; }
  .bullet { padding-left: 16px; position: relative; }
  .bullet::before { content: "•"; position: absolute; left: 4px; color: #2563eb; }
</style>
</head>
<body>`;

  if (headerLines.length > 0) {
    html += `<div class="name">${escapeHtml(headerLines[0])}</div>`;
    if (headerLines.length > 1) {
      html += `<div class="contact">${headerLines.slice(1).map(escapeHtml).join(' &nbsp;|&nbsp; ')}</div>`;
    }
    html += `<hr class="divider">`;
  }

  for (const section of sections) {
    html += `<div class="section-title">${escapeHtml(section.title)}</div>`;
    for (const line of section.lines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      const text = isBullet ? line.replace(/^[•\-\*]\s*/, '') : line;
      html += `<div class="line${isBullet ? ' bullet' : ''}">${escapeHtml(text)}</div>`;
    }
  }

  html += `</body></html>`;
  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Clean up old temp files (older than 1 hour)
 */
function cleanupTempFiles() {
  const files = fs.readdirSync(TEMP_DIR);
  const oneHourAgo = Date.now() - 3600000;
  for (const file of files) {
    const filePath = path.join(TEMP_DIR, file);
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < oneHourAgo) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = { generateDOCX, generateResumeHTML, cleanupTempFiles };
