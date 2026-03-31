/**
 * ATS Resume Optimizer - Backend Server
 * Express API with Claude AI integration
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { optimizeRouter } = require('./routes/optimize');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve temp files for download
app.use('/downloads', express.static(path.join(__dirname, '../temp')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', optimizeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ATS Resume Optimizer API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});
