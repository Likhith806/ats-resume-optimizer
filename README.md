# ATS Resume Optimizer

An AI-powered full-stack web app that rewrites your resume to be ATS-friendly and tailored to any job description — powered by Claude AI.

---

## Features

- Upload resume as **PDF, DOCX, or TXT** (or paste text)
- Upload job description as a **file or pasted text**
- AI rewrites the resume with **ATS-optimized formatting**
- Shows **keywords added** and an **improvement summary**
- **Match score** between resume and JD
- Download result as **DOCX** or **PDF**
- Clean, modern dark UI with drag-and-drop

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Backend    | Node.js + Express                 |
| AI         | Anthropic Claude API              |
| File parse | pdf-parse, mammoth (DOCX)         |
| Export     | docx (DOCX generation)            |

---

## Project Structure

```
ats-resume-optimizer/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server entry point
│   │   ├── routes/
│   │   │   └── optimize.js        # API routes (/optimize, /download/docx, /preview/html)
│   │   ├── services/
│   │   │   └── claudeService.js   # Claude AI integration
│   │   └── utils/
│   │       ├── fileParser.js      # PDF/DOCX/TXT text extraction
│   │       └── documentGenerator.js # DOCX + HTML output generation
│   ├── temp/                      # Temporary generated files (auto-cleaned)
│   ├── .env.example               # Environment variable template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Root component
│   │   ├── main.jsx               # Entry point
│   │   ├── index.css              # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── Header.jsx         # App header
│   │   │   ├── FileUpload.jsx     # Drag-and-drop upload component
│   │   │   ├── LoadingState.jsx   # Animated loading overlay
│   │   │   ├── ResultPanel.jsx    # Output display + download buttons
│   │   │   └── ScoreRing.jsx      # Animated match score ring
│   │   └── hooks/
│   │       └── useOptimizer.js    # API communication + state management
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── setup.sh                       # One-command setup script
└── README.md
```

---

## Quick Start

### Step 1 — Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

### Step 2 — Run setup

```bash
# Make setup script executable and run it
chmod +x setup.sh && ./setup.sh
```

Or do it manually:

### Manual Setup

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev
```

#### Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/api/optimize`       | Upload resume + JD, get AI result  |
| POST   | `/api/download/docx`  | Generate and download DOCX file    |
| POST   | `/api/preview/html`   | Get formatted HTML for PDF print   |
| GET    | `/health`             | Server health check                |

### POST `/api/optimize`

Accepts `multipart/form-data` with:
- `resume` (file) OR `resumeText` (string)
- `jd` (file) OR `jdText` (string)

Returns:
```json
{
  "success": true,
  "optimizedResume": "Full rewritten resume text...",
  "keywords": ["React", "Node.js", "REST API", "..."],
  "improvementSummary": "The resume was restructured to...",
  "score": 87,
  "scoreJustification": "Strong alignment with required skills.",
  "generatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Environment Variables

Create `backend/.env` from the template:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
PORT=3001
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ANTHROPIC_API_KEY not set` | Add your key to `backend/.env` |
| Port 3001 already in use | Change `PORT` in `.env` and update `vite.config.js` proxy |
| PDF upload fails | Ensure the PDF has selectable text (not a scanned image) |
| DOCX download blank | Check that resume text was returned from AI |
| Frontend can't reach backend | Ensure backend is running on port 3001 |

---

## License

MIT — free to use and modify.
