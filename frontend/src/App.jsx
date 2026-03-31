/**
 * App.jsx
 * Root component — manages upload state, orchestrates optimization flow
 */

import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import LoadingState from './components/LoadingState';
import ResultPanel from './components/ResultPanel';
import { useOptimizer } from './hooks/useOptimizer';

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function StepBadge({ n, active, done }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium flex-shrink-0 transition-all duration-300
      ${done ? 'bg-ink-500 text-white' : active ? 'bg-ink-500/20 text-ink-300 border border-ink-500/40' : 'bg-slate-800 text-slate-600 border border-slate-700/50'}`}>
      {done ? (
        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
        </svg>
      ) : n}
    </div>
  );
}

export default function App() {
  const [resume, setResume] = useState({ file: null, text: null });
  const [jd, setJd] = useState({ file: null, text: null });
  const { loading, error, result, progress, optimize, downloadDOCX, downloadPDF, reset } = useOptimizer();

  const hasResume = resume.file || resume.text;
  const hasJD = jd.file || jd.text;
  const canGenerate = hasResume && hasJD && !loading;

  const handleGenerate = () => {
    optimize({
      resumeFile: resume.file,
      resumeText: resume.text,
      jdFile: jd.file,
      jdText: jd.text,
    });
  };

  const handleReset = () => {
    setResume({ file: null, text: null });
    setJd({ file: null, text: null });
    reset();
  };

  return (
    <div className="min-h-screen font-body">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Header />

        {/* ── Main content ───────────────────────────────────────────────── */}
        {result ? (
          <ResultPanel
            result={result}
            onDownloadDOCX={downloadDOCX}
            onDownloadPDF={downloadPDF}
            onReset={handleReset}
          />
        ) : loading ? (
          <div className="card p-8">
            <LoadingState progress={progress} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload card */}
            <div className="card p-6 space-y-6">
              {/* Step 1 — Resume */}
              <div className="flex gap-4">
                <StepBadge n={1} active={true} done={!!hasResume} />
                <div className="flex-1 min-w-0">
                  <FileUpload
                    label="Your resume"
                    sublabel="Upload or paste your current resume"
                    value={resume}
                    onChange={setResume}
                    showTextFallback={true}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/60" />

              {/* Step 2 — JD */}
              <div className="flex gap-4">
                <StepBadge n={2} active={!!hasResume} done={!!hasJD} />
                <div className="flex-1 min-w-0">
                  <FileUpload
                    label="Job description"
                    sublabel="Upload or paste the JD you're targeting"
                    value={jd}
                    onChange={setJd}
                    showTextFallback={true}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/60" />

              {/* Step 3 — Generate */}
              <div className="flex gap-4 items-start">
                <StepBadge n={3} active={canGenerate} done={false} />
                <div className="flex-1">
                  <p className="section-label mb-3">Generate</p>
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
                  >
                    <SparkleIcon />
                    Generate optimized resume
                  </button>
                  {!hasResume && !hasJD && (
                    <p className="text-xs text-slate-600 text-center mt-2">
                      Upload both files above to continue
                    </p>
                  )}
                  {hasResume && !hasJD && (
                    <p className="text-xs text-slate-600 text-center mt-2">
                      Now add the job description
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 animate-fade-up">
                <AlertIcon />
                <div>
                  <p className="text-sm font-medium mb-0.5">Something went wrong</p>
                  <p className="text-xs text-red-400/80">{error}</p>
                </div>
              </div>
            )}

            {/* Info strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔒', label: 'Private', desc: 'Files processed in memory only' },
                { icon: '⚡', label: 'Fast', desc: 'Results in under 30 seconds' },
                { icon: '✦', label: 'ATS-ready', desc: 'Keyword-optimized output' },
              ].map((item) => (
                <div key={item.label} className="card p-3 text-center">
                  <p className="text-lg mb-1">{item.icon}</p>
                  <p className="text-xs font-medium text-slate-300">{item.label}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
