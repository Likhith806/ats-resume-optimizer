/**
 * optimize.js - API Routes
 * POST /api/optimize  → upload files, run AI, return result
 * POST /api/download  → generate and return DOCX file
 * GET  /api/preview   → return formatted HTML for PDF print
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractText } = require('../utils/fileParser');
const { optimizeResume } = require('../services/claudeService');
const { generateDOCX, generateResumeHTML, cleanupTempFiles } = require('../utils/documentGenerator');

const router = express.Router();

// ─── Multer config (memory storage, no disk writes for uploads) ──────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || ['.pdf', '.docx', '.txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Use PDF, DOCX, or TXT.`));
    }
  },
});

// ─── POST /api/optimize ───────────────────────────────────────────────────────
router.post(
  '/optimize',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'jd', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // ── Extract resume text ────────────────────────────────────────────────
      let resumeText = '';
      if (req.files?.resume?.[0]) {
        const file = req.files.resume[0];
        resumeText = await extractText(file.buffer, file.mimetype, file.originalname);
      } else if (req.body.resumeText) {
        resumeText = req.body.resumeText.trim();
      }

      if (!resumeText) {
        return res.status(400).json({ error: 'Resume is required. Upload a file or paste text.' });
      }

      // ── Extract JD text ────────────────────────────────────────────────────
      let jdText = '';
      if (req.files?.jd?.[0]) {
        const file = req.files.jd[0];
        jdText = await extractText(file.buffer, file.mimetype, file.originalname);
      } else if (req.body.jdText) {
        jdText = req.body.jdText.trim();
      }

      if (!jdText) {
        return res.status(400).json({ error: 'Job description is required. Upload a file or paste text.' });
      }

      // ── Validate minimum content ───────────────────────────────────────────
      if (resumeText.length < 100) {
        return res.status(400).json({ error: 'Resume text is too short. Please provide a complete resume.' });
      }
      if (jdText.length < 50) {
        return res.status(400).json({ error: 'Job description is too short. Please provide a full job description.' });
      }

      // ── Run AI optimization ────────────────────────────────────────────────
      console.log(`[optimize] Processing resume (${resumeText.length} chars) against JD (${jdText.length} chars)`);
      const result = await optimizeResume(resumeText, jdText);

      // Cleanup old temp files opportunistically
      try { cleanupTempFiles(); } catch (_) {}

      return res.json({
        success: true,
        ...result,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[optimize] Error:', err.message);
      if (err.message.includes('ANTHROPIC_API_KEY')) {
        return res.status(500).json({ error: 'API key not configured. Add ANTHROPIC_API_KEY to backend/.env' });
      }
      return res.status(500).json({ error: err.message || 'Optimization failed' });
    }
  }
);

// ─── POST /api/download/docx ──────────────────────────────────────────────────
router.post('/download/docx', async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'resumeText is required' });

    const filename = `optimized-resume-${Date.now()}.docx`;
    const filePath = await generateDOCX(resumeText, filename);

    res.download(filePath, 'Optimized_Resume.docx', (err) => {
      if (err) console.error('Download error:', err);
      // Clean up file after sending
      try { fs.unlinkSync(filePath); } catch (_) {}
    });
  } catch (err) {
    console.error('[download/docx] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/preview/html ───────────────────────────────────────────────────
router.post('/preview/html', (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'resumeText is required' });
    const html = generateResumeHTML(resumeText);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { optimizeRouter: router };
