"use client";

import React, { useEffect, useState } from 'react';
import { playTurnAlertSound, playCountdownTick, triggerHaptic } from '@/lib/sound';
import { EyeOff, Sparkles, Volume2 } from 'lucide-react';
import { DubMascot } from './DubMascot';

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
        <div className="mt-4 px-4 py-2 bg-black/85 rounded-full border-2 border-emerald-300 text-xs sm:text-sm font-black tracking-wide flex items-center gap-2 shadow-xl">
          <EyeOff className="w-4 h-4 text-emerald-400" />
          <span>TURN PHONE SCREEN AWAY FROM EVERYONE!</span>
        </div>

        {/* Center Main Turn Alert */}
        <div className="my-auto max-w-sm flex flex-col items-center">
          <DubMascot size="lg" withSpeechBubble="YOUR TURN! 🎬" />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white text-zinc-950 flex items-center justify-center font-black text-4xl sm:text-5xl border-4 border-zinc-950 shadow-[6px_6px_0px_#000] animate-bounce my-4">
            {remaining}
          </div>

          <div className="space-y-1.5">
            <h1 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-white tracking-tight drop-shadow-md">
              IT&apos;S YOUR TURN TO ACT!
            </h1>
            <p className="text-sm font-bold text-emerald-100 max-w-xs mx-auto leading-snug">
              Get ready to act out the secret meme! Remember: no talking or whispering allowed!
            </p>
          </div>
        </div>

        {/* Bottom Sound Pill */}
        <div className="mb-4 px-3.5 py-1.5 bg-black/75 rounded-full text-xs font-bold text-emerald-200 border border-emerald-400/40 flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Starting in {remaining}s...</span>
        </div>
      </div>
    );
  }

  // GUESSER PERSPECTIVE
  return (
    <div className="fixed inset-0 z-50 bg-[#121316] flex flex-col items-center justify-between p-6 text-white text-center select-none">
      <div className="mt-4 px-4 py-2 bg-[#ff5500]/20 rounded-full border border-[#ff5500]/40 text-xs sm:text-sm font-black uppercase text-[#ff7a1a] tracking-wider">
        <span>Get Ready to Guess</span>
      </div>

      <div className="my-auto max-w-sm flex flex-col items-center">
        <DubMascot size="lg" withSpeechBubble="WATCH CLOSELY! 👀" />

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#18191e] border-3 border-zinc-700 text-[#ffb800] flex items-center justify-center font-black text-4xl sm:text-5xl shadow-[4px_4px_0px_#000] my-4">
          {remaining}
        </div>

        <div className="space-y-1.5">
          <h2 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-white tracking-tight">
            {actorName}&apos;s Turn!
          </h2>
          <p className="text-sm font-bold text-zinc-400 max-w-xs mx-auto leading-snug">
            Look up from your phone and watch {actorName} act out the meme in real life!
          </p>
        </div>
      </div>

      <div className="mb-4 px-3.5 py-1.5 bg-zinc-900 rounded-full text-xs font-bold text-zinc-400 border border-zinc-800">
        Round starting in {remaining}s...
      </div>
    </div>
  );
}
