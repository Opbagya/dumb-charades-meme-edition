"use client";

import React from 'react';
import { Timer } from 'lucide-react';

interface DigitalTimerProps {
  secondsRemaining: number;
  totalSeconds?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function DigitalTimer({ secondsRemaining, totalSeconds = 60, size = 'lg' }: DigitalTimerProps) {
  const safeSeconds = Math.max(0, Math.floor(secondsRemaining));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isCritical = safeSeconds <= 10;
  const isWarning = safeSeconds > 10 && safeSeconds <= 25;

  const textColor = isCritical
    ? 'text-red-500 animate-pulse'
    : isWarning
    ? 'text-amber-400'
    : 'text-emerald-400';

  const borderColor = isCritical
    ? 'border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
    : isWarning
    ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    : 'border-zinc-800 shadow-[0_0_15px_rgba(16,185,129,0.25)]';

  const progressPercent = Math.min(100, Math.max(0, (safeSeconds / totalSeconds) * 100));

  if (size === 'sm') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border-2 border-zinc-800 text-white shadow-sm">
        <Timer className={`w-3.5 h-3.5 ${textColor}`} />
        <span className={`font-digital font-bold text-sm tracking-wider ${textColor}`}>
          {formattedTime}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative bg-zinc-950 rounded-2xl border-3 ${borderColor} p-3 sm:p-4 text-center overflow-hidden transition-all duration-300`}>
      {/* Background digital grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:8px_8px]" />

      {/* Top Header Label */}
      <div className="relative flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-800 pb-1.5 mb-2">
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          Charades Timer
        </span>
        <span className="font-mono text-zinc-500">{safeSeconds}s left</span>
      </div>

      {/* Big Digital Numbers */}
      <div className="relative py-1 flex items-baseline justify-center gap-1">
        <span
          className={`font-digital font-black text-4xl sm:text-5xl tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] ${textColor}`}
        >
          {formattedTime}
        </span>
      </div>

      {/* Retro progress bar */}
      <div className="relative w-full h-2 bg-zinc-900 rounded-full overflow-hidden mt-2 border border-zinc-800">
        <div
          className={`h-full transition-all duration-300 ease-linear rounded-full ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
