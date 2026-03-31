/**
 * ResultPanel.jsx
 * Displays optimized resume, keywords, improvement summary, and download buttons
 */

import React, { useState } from 'react';
import ScoreRing from './ScoreRing';

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function ResumeText({ text }) {
  // Render resume text with basic formatting
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // Detect section headers (all caps or known headers)
        const upperLine = trimmed.toUpperCase();
        const isSectionHeader =
          upperLine === trimmed.replace(/[^A-Z\s]/g, '') && trimmed.length < 40 && trimmed.length > 2;

        if (isSectionHeader && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
          return (
            <div key={i} className="mt-4 first:mt-0">
              <p className="font-display font-bold text-ink-300 text-sm uppercase tracking-widest pb-1 border-b border-ink-500/20">
                {trimmed}
              </p>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="text-ink-400 mt-1 flex-shrink-0 text-xs">•</span>
              <p className="text-sm text-slate-300 leading-relaxed">{bulletText}</p>
            </div>
          );
        }

        // Regular line
        return (
          <p key={i} className="text-sm text-slate-300 leading-relaxed">{trimmed}</p>
        );
      })}
    </div>
  );
}

export default function ResultPanel({ result, onDownloadDOCX, onDownloadPDF, onReset }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('resume');

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimizedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'resume', label: 'Optimized Resume' },
    { id: 'analysis', label: 'Analysis' },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-white">Your optimized resume</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ready to download or copy</p>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700/50 rounded-lg px-3 py-1.5"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
          </svg>
          Start over
        </button>
      </div>

      {/* Score + Quick stats */}
      {result.score != null && (
        <div className="card p-4 flex items-center gap-6">
          <ScoreRing score={result.score} size={90} />
          <div className="flex-1">
            <p className="section-label mb-1">ATS Match Score</p>
            <p className="text-sm text-slate-300 leading-relaxed">{result.scoreJustification || 'Resume optimized for this job description.'}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-150
              ${activeTab === tab.id
                ? 'bg-ink-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resume tab */}
      {activeTab === 'resume' && (
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40 bg-slate-900/40">
            <span className="text-xs text-slate-500 font-mono">optimized_resume.txt</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all
                ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600'}`}
            >
              <CopyIcon />
              {copied ? 'Copied!' : 'Copy all'}
            </button>
          </div>
          {/* Content */}
          <div className="p-5 max-h-[520px] overflow-y-auto">
            <ResumeText text={result.optimizedResume} />
          </div>
        </div>
      )}

      {/* Analysis tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {/* Keywords */}
          {result.keywords?.length > 0 && (
            <div className="card p-5">
              <p className="section-label mb-3">Keywords added / emphasized</p>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="keyword-chip">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Improvement summary */}
          {result.improvementSummary && (
            <div className="card p-5">
              <p className="section-label mb-3">What was improved</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {result.improvementSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onDownloadDOCX(result.optimizedResume)}
          className="btn-primary flex items-center justify-center gap-2 text-sm"
        >
          <DownloadIcon />
          Download DOCX
        </button>
        <button
          onClick={() => onDownloadPDF(result.optimizedResume)}
          className="btn-ghost flex items-center justify-center gap-2 text-sm"
        >
          <DownloadIcon />
          Download PDF
        </button>
      </div>

      <p className="text-center text-xs text-slate-600">
        PDF opens a print dialog — choose "Save as PDF" in your browser.
      </p>
    </div>
  );
}
