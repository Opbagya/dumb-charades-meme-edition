"use client";

import React from 'react';
import { GameState } from '@/types/game';
import { EyeOff, Trophy, Timer } from 'lucide-react';

interface GuesserViewProps {
  gameState: GameState;
  secondsRemaining: number;
}

export function GuesserView({ gameState, secondsRemaining }: GuesserViewProps) {
  const currentActorId = gameState.turnOrder[gameState.currentTurnIndex];
  const actor = gameState.players.find((p) => p.id === currentActorId);

  const safeSeconds = Math.max(0, Math.floor(secondsRemaining));
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const isCritical = safeSeconds <= 10;
  const isWarning = safeSeconds > 10 && safeSeconds <= 25;
  const timerColor = isCritical
    ? 'text-red-500 animate-pulse'
    : isWarning
    ? 'text-amber-400'
    : 'text-emerald-400';

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-2 sm:p-3 overflow-hidden select-none">
      {/* 1. TOP HEADER WITH DIGITAL TIMER */}
      <div className="flex items-center justify-between gap-2 bg-zinc-950 text-white rounded-xl border-2 border-zinc-900 px-3 py-1.5 shadow-[2px_2px_0px_#000] shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 tracking-wider">
          <EyeOff className="w-3.5 h-3.5" />
          Guessing
        </span>

        {/* Digital Stopwatch in Header */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-black border border-zinc-800">
          <Timer className={`w-3.5 h-3.5 ${timerColor}`} />
          <span className={`font-digital font-black text-2xl tracking-wider leading-none ${timerColor}`}>
            {formattedTime}
          </span>
        </div>

        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
          R{gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {/* 2. CENTER STAGE (Meme strictly hidden) */}
      <div className="flex-1 min-h-0 my-2 neo-box bg-white overflow-hidden p-4 flex flex-col items-center justify-center text-center">
        <span className="px-3 py-1 rounded-full bg-red-100 border-2 border-red-600 text-red-700 text-xs font-black uppercase tracking-wider mb-2 animate-pulse">
          Center Stage
        </span>

        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-200 border-3 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex items-center justify-center text-5xl mb-2">
          {actor?.avatar || '🎭'}
        </div>

        <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-zinc-900 leading-tight">
          {actor?.name || 'Player'}
        </h3>
        <p className="text-xs font-bold text-zinc-500">is acting right now!</p>

        {/* Anti-Peeking Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-zinc-950 text-white border-2 border-zinc-800 text-center max-w-xs">
          <p className="text-xs font-black text-amber-400 uppercase flex items-center justify-center gap-1">
            <EyeOff className="w-3.5 h-3.5" /> Watch {actor?.name}!
          </p>
          <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
            Shout your guesses out loud in the room! First right guess gets +1 point!
          </p>
        </div>
      </div>

      {/* 3. COMPACT LIVE SCOREBOARD */}
      <div className="neo-box-sm bg-white p-2.5 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-black uppercase text-zinc-700 mb-1.5 border-b border-zinc-200 pb-1">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Leaderboard
          </span>
          <span className="text-[10px] text-zinc-400">Alphabetical Turns</span>
        </div>

        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
          {gameState.players.map((p) => {
            const isCurrentActor = p.id === currentActorId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between px-2.5 py-1 rounded-lg border text-xs ${
                  isCurrentActor
                    ? 'bg-amber-100 border-amber-500 font-black'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{p.avatar}</span>
                  <span className="truncate max-w-36">{p.name}</span>
                  {isCurrentActor && (
                    <span className="text-[8px] bg-amber-500 text-zinc-950 px-1 py-0.1 rounded font-black">
                      ACTOR
                    </span>
                  )}
                </div>
                <span className="font-mono font-black text-zinc-900">{p.score} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
