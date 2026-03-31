/**
 * LoadingState.jsx
 * Animated loading overlay shown during AI processing
 */

import React, { useEffect, useState } from 'react';

const DOTS = [0, 1, 2];

export default function LoadingState({ progress }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8 animate-fade-up">
      {/* Spinning rings */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-ink-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ink-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-ink-300/50 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-ink-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-slate-200 font-medium text-base">
          {progress || 'Processing your resume…'}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          {DOTS.map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-ink-400 transition-opacity duration-300"
              style={{ opacity: (tick + i) % 3 === 0 ? 1 : 0.25 }}
            />
          ))}
        </div>
      </div>

      {/* Processing steps */}
      <div className="w-full max-w-xs space-y-2">
        {[
          'Parsing uploaded documents',
          'Analyzing job requirements',
          'Rewriting with AI',
          'Generating output',
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
              ${tick > i * 5 + 2 ? 'bg-ink-500' : 'bg-slate-800 border border-slate-700'}`}>
              {tick > i * 5 + 2 && (
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </div>
            <span className={`text-xs transition-colors duration-500 ${tick > i * 5 + 2 ? 'text-slate-300' : 'text-slate-600'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-600 max-w-xs text-center">
        This usually takes 15–30 seconds depending on resume length.
      </p>
    </div>
  );
}
