"use client";

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '@/types/game';
import { playVictoryFanfare } from '@/lib/sound';
import { Crown, Medal, RefreshCw, Trophy } from 'lucide-react';

interface LeaderboardPodiumProps {
  gameState: GameState;
  onRestart: () => void;
  onLeaveRoom?: () => void;
}

export function LeaderboardPodium({ gameState, onRestart, onLeaveRoom }: LeaderboardPodiumProps) {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  useEffect(() => {
    playVictoryFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 text-center select-none animate-in zoom-in-95 duration-200">
      {/* Title */}
      <div className="inline-block px-4 py-1 rounded-full bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-widest border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b] mb-2">
        🏆 Game Completed!
      </div>
      <h2 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-zinc-900 tracking-tight">
        Final Standings
      </h2>
      <p className="text-xs font-bold text-zinc-500 mt-0.5 mb-6">
        All players took their turn! Here are the meme charades champions:
      </p>

      {/* Podium Visualization */}
      <div className="flex items-end justify-center gap-2 sm:gap-3 mb-6 pt-4 px-2">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1">{second.avatar}</span>
            <span className="font-extrabold text-xs text-zinc-900 truncate max-w-20">
              {second.name}
            </span>
            <span className="text-[11px] font-bold text-zinc-600 mb-1">{second.score} pts</span>
            <div className="w-full h-24 bg-zinc-200 rounded-t-2xl border-3 border-zinc-900 flex flex-col items-center justify-center shadow-[3px_3px_0px_#18181b]">
              <Medal className="w-6 h-6 text-zinc-400" />
              <span className="font-black text-lg text-zinc-700">2nd</span>
            </div>
          </div>
        )}

        {/* 1st Place (Center, Tallest) */}
        {first && (
          <div className="flex-1 flex flex-col items-center">
            <Crown className="w-7 h-7 text-amber-500 fill-amber-400 animate-bounce mb-0.5" />
            <span className="text-4xl mb-1">{first.avatar}</span>
            <span className="font-black text-sm text-zinc-950 truncate max-w-24">
              {first.name}
            </span>
            <span className="text-xs font-black text-amber-600 mb-1">{first.score} pts</span>
            <div className="w-full h-32 bg-amber-300 rounded-t-2xl border-3 border-zinc-900 flex flex-col items-center justify-center shadow-[4px_4px_0px_#18181b]">
              <Trophy className="w-8 h-8 text-amber-600" />
              <span className="font-black text-xl text-zinc-900">1st</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1">{third.avatar}</span>
            <span className="font-extrabold text-xs text-zinc-900 truncate max-w-20">
              {third.name}
            </span>
            <span className="text-[11px] font-bold text-zinc-600 mb-1">{third.score} pts</span>
            <div className="w-full h-18 bg-amber-700/20 rounded-t-2xl border-3 border-zinc-900 flex flex-col items-center justify-center shadow-[3px_3px_0px_#18181b]">
              <Medal className="w-5 h-5 text-amber-700" />
              <span className="font-black text-base text-zinc-700">3rd</span>
            </div>
          </div>
        )}
      </div>

      {/* Full Player Scores List */}
      <div className="neo-box bg-white p-4 mb-6 text-left">
        <h4 className="font-black text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-200 pb-2 mb-2 flex items-center justify-between">
          <span>All Players & Scores</span>
          <span>Rank</span>
        </h4>
        <div className="space-y-2">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border-2 border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-zinc-400 w-4">#{idx + 1}</span>
                <span className="text-2xl">{player.avatar}</span>
                <div>
                  <p className="font-black text-sm text-zinc-900">{player.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">
                    {idx === 0 ? '👑 Meme Master' : 'Player'}
                  </p>
                </div>
              </div>
              <div className="font-digital font-black text-lg text-red-600">
                {player.score} <span className="text-xs font-sans text-zinc-500">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={onRestart}
          className="w-full neo-btn bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000]"
        >
          <RefreshCw className="w-5 h-5 stroke-[3]" />
          <span>Play Rematch / New Game</span>
        </button>

        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            className="w-full py-3 rounded-xl bg-white border-2 border-zinc-900 text-zinc-800 font-black text-xs hover:bg-zinc-100 shadow-[2px_2px_0px_#000]"
          >
            ← Back to Home Menu
          </button>
        )}
      </div>
    </div>
  );
}
