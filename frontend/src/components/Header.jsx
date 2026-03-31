/**
 * Header.jsx
 */
import React from 'react';

export default function Header() {
  return (
    <header className="relative py-12 text-center">
      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-ink-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-500/10 border border-ink-500/25 mb-5">
          <div className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-pulse-slow" />
          <span className="text-xs font-mono text-ink-300 tracking-wide">Powered by Claude AI</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-white mb-3 leading-tight">
          ATS Resume
          <span className="italic text-ink-400"> Optimizer</span>
        </h1>

        <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
          Upload your resume and any job description. Get an ATS-optimized,
          keyword-matched resume in seconds.
        </p>
      </div>
    </header>
  );
}
