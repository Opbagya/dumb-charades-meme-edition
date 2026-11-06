"use client";

import React, { useEffect, useState } from 'react';
import { playTurnAlertSound, playCountdownTick, triggerHaptic } from '@/lib/sound';
import { EyeOff, Sparkles, Volume2 } from 'lucide-react';

interface GreenTurnAlertProps {
  isActor: boolean;
  actorName: string;
  countdownEndsAt: number | null;
  onCountdownComplete: () => void;
}

export function GreenTurnAlert({
  isActor,
  actorName,
  countdownEndsAt,
  onCountdownComplete,
}: GreenTurnAlertProps) {
  const [remaining, setRemaining] = useState<number>(3);

  useEffect(() => {
    if (isActor) {
      playTurnAlertSound();
      triggerHaptic([200, 100, 200, 100, 300]);
    }

    const interval = setInterval(() => {
      if (!countdownEndsAt) return;
      const msLeft = countdownEndsAt - Date.now();
      const secs = Math.ceil(msLeft / 1000);

      if (secs <= 0) {
        clearInterval(interval);
        onCountdownComplete();
      } else {
        setRemaining(secs);
        playCountdownTick(secs === 1);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [countdownEndsAt, isActor, onCountdownComplete]);

  if (isActor) {
    return (
      <div className="fixed inset-0 z-50 animate-turn-green flex flex-col items-center justify-between p-6 text-white text-center select-none overflow-hidden">
        {/* Top Warning Banner */}
        <div className="mt-4 px-4 py-2 bg-black/80 rounded-full border-2 border-emerald-300 text-xs sm:text-sm font-black tracking-wide flex items-center gap-2 shadow-lg">
          <EyeOff className="w-4 h-4 text-emerald-400" />
          <span>TURN PHONE AWAY FROM EVERYONE!</span>
        </div>

        {/* Center Main Turn Alert */}
        <div className="my-auto max-w-sm flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-zinc-950 flex items-center justify-center font-black text-4xl sm:text-5xl border-4 border-zinc-950 shadow-[6px_6px_0px_#000] animate-bounce">
            {remaining}
          </div>

          <div className="mt-6 space-y-2">
            <span className="inline-block px-3 py-1 bg-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-full border-2 border-zinc-950 shadow-sm">
              🚨 Ready to Perform 🚨
            </span>
            <h2 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-white tracking-tight drop-shadow-md">
              IT&apos;S YOUR TURN!
            </h2>
            <p className="text-sm font-medium text-emerald-100 max-w-xs leading-relaxed">
              In 3 seconds, your secret meme GIF will be revealed. You will have 1 minute to act it out!
            </p>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mb-6 px-4 py-2 bg-black/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 border border-white/10">
          <Volume2 className="w-4 h-4" />
          <span>Meme plays muted • No talking allowed!</span>
        </div>
      </div>
    );
  }

  // View for all other guessing players
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 text-white text-center select-none">
      <div className="mt-4 px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-700 text-xs font-bold text-zinc-400 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>NEXT ACTOR GETTING READY</span>
      </div>

      <div className="my-auto max-w-xs flex flex-col items-center">
        <div className="w-18 h-18 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center font-mono font-black text-3xl border-3 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          {remaining}
        </div>

        <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-white mt-5">
          <span className="text-amber-400">{actorName}</span> is up next!
        </h3>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Watch them closely! As soon as the timer starts, shout your answers in real life.
        </p>
      </div>

      <div className="mb-6 text-[11px] text-zinc-500 font-medium">
        First person to guess correctly wins +1 point!
      </div>
    </div>
  );
}
