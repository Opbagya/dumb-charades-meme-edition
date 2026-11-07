"use client";

import React from 'react';
import { GameState } from '@/types/game';
import { EyeOff, Trophy, Timer, Sparkles } from 'lucide-react';
import { DubDuelBar } from './DubDuelBar';
import { DubMascot } from './DubMascot';

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
    ? 'text-[#ffb800]'
    : 'text-emerald-400';

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-2 sm:p-3 overflow-hidden select-none">
      {/* 1. TOP HEADER WITH DIGITAL TIMER */}
      <div className="flex items-center justify-between gap-2 bg-[#18191e] border-2 border-zinc-800 text-white rounded-2xl px-3 py-1.5 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ffb800] animate-ping" />
          <span className="text-xs font-black uppercase text-[#ffb800] tracking-wider">
            Guess the Meme!
          </span>
        </div>

        {/* Digital Stopwatch in Header */}
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-black border border-zinc-800">
          <Timer className={`w-3.5 h-3.5 ${timerColor}`} />
          <span className={`font-digital font-black text-2xl tracking-wider leading-none ${timerColor}`}>
            {formattedTime}
          </span>
        </div>

        <span className="text-[10px] font-black uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
          R{gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {/* 2. DUBDUB LIVE DUEL RACE TRACK (Head-to-head live score progress) */}
      <div className="my-2 shrink-0">
        <DubDuelBar players={gameState.players} currentActorId={currentActorId} targetScore={5} />
      </div>

      {/* 3. CENTER STAGE (Meme strictly hidden from guessers) */}
      <div className="flex-1 min-h-0 my-1 dub-card-orange-glow p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Corner Mascot Sticker */}
        <div className="absolute top-2.5 right-2.5 opacity-90">
          <DubMascot size="sm" />
        </div>

        <span className="px-3 py-0.5 rounded-full bg-[#ff5500]/20 border border-[#ff5500]/50 text-[#ff7a1a] text-[10px] font-black uppercase tracking-widest mb-3 animate-pulse">
          🎭 Center Stage Actor
        </span>

        {/* Big Avatar Halo */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#121316] border-3 border-[#ff5500] shadow-[0_0_20px_rgba(255,85,0,0.3)] flex items-center justify-center text-5xl mb-2">
            {actor?.avatar || '🎭'}
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-[#ff5500] text-white rounded-lg text-[9px] font-black uppercase border border-black shadow">
            ACTOR
          </span>
        </div>

        <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-white leading-tight mt-1">
          {actor?.name || 'Player'}
        </h3>
        <p className="text-xs font-bold text-zinc-400">is acting out the meme in front of you!</p>

        {/* Anti-Peeking Callout */}
        <div className="mt-3 p-3 rounded-2xl bg-[#121316] border-2 border-zinc-800 text-center max-w-xs shadow-inner">
          <p className="text-xs font-black text-[#ffb800] uppercase flex items-center justify-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5" /> Watch their moves!
          </p>
          <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
            Shout your guesses out loud! First player to guess right earns +1 point!
          </p>
        </div>
      </div>

      {/* 4. COMPACT SQUAD STANDINGS */}
      <div className="dub-card-charcoal p-2.5 shrink-0">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-400 mb-1 px-1">
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#ffb800]" /> Squad Standings
          </span>
          <span>Alphabetical Turns</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          {gameState.players.map((p) => {
            const isActor = p.id === currentActorId;
            return (
              <div
                key={p.id}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs ${
                  isActor
                    ? 'bg-[#ff5500]/20 border-[#ff5500] font-black text-white'
                    : 'bg-[#121316] border-zinc-800 text-zinc-300'
                }`}
              >
                <span>{p.avatar}</span>
                <span className="truncate max-w-20 font-bold">{p.name}</span>
                <span className="font-black text-[#ffb800]">{p.score}pt</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
