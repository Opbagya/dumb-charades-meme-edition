"use client";

import React from 'react';
import { Player } from '@/types/game';

interface DubDuelBarProps {
  players: Player[];
  currentActorId?: string | null;
  targetScore?: number;
}

export function DubDuelBar({ players, currentActorId, targetScore = 5 }: DubDuelBarProps) {
  // Sort players by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);
  // Show top 2 or 3 players
  const duelists = sorted.slice(0, Math.min(3, sorted.length));

  if (duelists.length === 0) return null;

  return (
    <div className="w-full bg-[#18191e] border-2 border-zinc-800 rounded-2xl p-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.35)] select-none">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
            Live Duel Track
          </span>
        </div>
        <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
          🏁 First to {targetScore} Pts
        </span>
      </div>

      <div className="space-y-2">
        {duelists.map((player, idx) => {
          const isActor = player.id === currentActorId;
          const progressPercent = Math.min(100, Math.max(8, (player.score / targetScore) * 100));
          const colorGradient = idx === 0 
            ? 'from-amber-500 to-orange-500' 
            : idx === 1 
            ? 'from-blue-500 to-cyan-400' 
            : 'from-purple-500 to-pink-500';

          return (
            <div key={player.id} className="flex items-center gap-2">
              {/* Player Avatar & Name */}
              <div className="w-20 sm:w-24 flex items-center gap-1.5 truncate shrink-0">
                <span className="text-sm shrink-0">{player.avatar}</span>
                <span className={`text-[11px] font-bold truncate ${isActor ? 'text-amber-400 font-black' : 'text-zinc-200'}`}>
                  {player.name}
                  {isActor && ' 🎭'}
                </span>
              </div>

              {/* Race Track */}
              <div className="flex-1 h-5 bg-[#121316] rounded-full border border-zinc-800 relative overflow-hidden flex items-center px-1">
                {/* Track dash line */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-b border-dashed border-zinc-800 pointer-events-none" />

                {/* Progress fill */}
                <div 
                  className={`h-2.5 rounded-full bg-gradient-to-r ${colorGradient} transition-all duration-500 shadow-sm`}
                  style={{ width: `${progressPercent}%` }}
                />

                {/* Runner Pawn Icon at leading edge */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 text-xs drop-shadow"
                  style={{ left: `${Math.max(12, Math.min(92, progressPercent))}%` }}
                >
                  📍
                </div>

                {/* Checkered Finish Gate */}
                <div className="absolute right-0 inset-y-0 w-3 bg-checkered-track opacity-60 rounded-r-full" />
              </div>

              {/* Player Score */}
              <div className="w-8 text-right font-black text-xs text-white shrink-0">
                {player.score} <span className="text-[9px] text-zinc-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
