/**
 * ScoreRing.jsx
 * Animated circular progress ring for match score
 */

import React, { useEffect, useState } from 'react';

export default function ScoreRing({ score, size = 100 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    if (score == null) return;
    const target = Math.min(100, Math.max(0, score));
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayScore(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [score]);

  const color =
    displayScore >= 80 ? '#22c55e' :
    displayScore >= 60 ? '#3b82f6' :
    displayScore >= 40 ? '#f59e0b' : '#ef4444';

  const label =
    displayScore >= 80 ? 'Excellent' :
    displayScore >= 60 ? 'Good' :
    displayScore >= 40 ? 'Fair' : 'Low';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="score-ring"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.5s' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold" style={{ color }}>
            {displayScore}
          </span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wide">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium" style={{ color }}>{label} match</p>
      </div>
    </div>
  );
}
