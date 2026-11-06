"use client";

import React from 'react';
import { GameState } from '@/types/game';
import { DigitalTimer } from './DigitalTimer';
import { EyeOff, Flame, Trophy, Volume2 } from 'lucide-react';

interface GuesserViewProps {
  gameState: GameState;
  secondsRemaining: number;
}

export function GuesserView({ gameState, secondsRemaining }: GuesserViewProps) {
  const currentActorId = gameState.turnOrder[gameState.currentTurnIndex];
  const actor = gameState.players.find((p) => p.id === currentActorId);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-2 pb-8">
      {/* Guesser Status Banner */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b]">
          <EyeOff className="w-3.5 h-3.5" />
          Guessing Mode
        </span>
        <span className="text-xs font-bold text-zinc-600 bg-amber-100/90 border border-zinc-300 px-2.5 py-0.5 rounded-full">
          Round {gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {/* Synchronized Reverse Digital Timer */}
      <div className="w-full mb-4">
        <DigitalTimer secondsRemaining={secondsRemaining} totalSeconds={60} />
      </div>

      {/* Secret Actor Stage Card (Meme is strictly hidden from guessers) */}
      <div className="w-full neo-box bg-white overflow-hidden text-center p-6 mb-4">
        <div className="inline-block px-3 py-1 rounded-full bg-red-100 border-2 border-red-600 text-red-700 text-xs font-black uppercase tracking-wider mb-4 animate-pulse">
          🎭 Center Stage
        </div>

        <div className="w-24 h-24 mx-auto rounded-full bg-amber-200 border-4 border-zinc-900 shadow-[4px_4px_0px_#18181b] flex items-center justify-center text-5xl mb-3">
          {actor?.avatar || '🎭'}
        </div>

        <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-zinc-900">
          {actor?.name || 'Player'}
        </h3>
        <p className="text-xs font-bold text-zinc-500 mt-0.5">is acting out a secret meme right now!</p>

        {/* Anti-Peeking Notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-zinc-950 text-white border-2 border-zinc-800 text-center">
          <p className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center justify-center gap-1.5">
            <EyeOff className="w-4 h-4" /> Look at {actor?.name}, Not Your Screen!
          </p>
          <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
            Shout your guesses out loud in the room! If you get it right, {actor?.name} will tap your name and your phone will celebrate!
          </p>
        </div>
      </div>

      {/* Live Room Scoreboard */}
      <div className="w-full neo-box-sm bg-white/95 p-3.5">
        <div className="flex items-center justify-between text-xs font-black uppercase text-zinc-700 mb-2 border-b border-zinc-200 pb-1">
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Live Scoreboard
          </span>
          <span className="text-[10px] text-zinc-400">Alphabetical Turn Order</span>
        </div>

        <div className="space-y-1.5">
          {gameState.players.map((p) => {
            const isCurrentActor = p.id === currentActorId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg border ${
                  isCurrentActor
                    ? 'bg-amber-100/90 border-amber-500 font-black'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{p.avatar}</span>
                  <span className="text-xs font-bold truncate max-w-32">{p.name}</span>
                  {isCurrentActor && (
                    <span className="text-[9px] bg-amber-500 text-zinc-950 px-1.5 py-0.2 rounded-full font-black">
                      ACTOR
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono font-black text-zinc-900">{p.score} pts</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
