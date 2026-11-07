"use client";

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '@/types/game';
import { playVictoryFanfare } from '@/lib/sound';
import { Crown, Medal, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';
import { DubMascot } from './DubMascot';

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
  const remainingPlayers = sortedPlayers.slice(3);

  useEffect(() => {
    playVictoryFanfare();
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#ff5500', '#ffb800', '#10b981', '#ffffff'],
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 text-center select-none animate-in zoom-in-95 duration-200">
      {/* DubDub Mascot Celebration */}
      <div className="flex justify-center mb-2">
        <DubMascot size="lg" withSpeechBubble="CHAMPION! 🏆" />
      </div>

      {/* Title */}
      <div className="inline-block px-3.5 py-1 rounded-full bg-[#ff5500]/15 border border-[#ff5500]/40 text-[#ff5500] font-black text-xs uppercase tracking-widest mb-1.5">
        ⚡ Match Completed!
      </div>
      <h2 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-zinc-950 tracking-tight">
        Squad Champions
      </h2>
      <p className="text-xs font-bold text-zinc-500 mt-0.5 mb-5">
        Here are the meme charades masters of this match:
      </p>

      {/* DubDub 3D Arena Podium */}
      <div className="flex items-end justify-center gap-2.5 mb-6 pt-4 px-2">
        {/* 2nd Place */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1 filter drop-shadow">{second.avatar}</span>
            <span className="font-extrabold text-xs text-zinc-900 truncate max-w-20">
              {second.name}
            </span>
            <span className="text-[11px] font-bold text-zinc-600 mb-1.5">{second.score} pts</span>
            <div className="w-full h-24 bg-gradient-to-b from-slate-200 to-slate-400 rounded-t-2xl border-3 border-zinc-950 flex flex-col items-center justify-center shadow-[3px_3px_0px_#121316]">
              <div className="w-7 h-7 rounded-full bg-slate-300 border-2 border-zinc-900 flex items-center justify-center mb-1">
                <span className="font-black text-xs text-zinc-800">2</span>
              </div>
              <span className="font-black text-sm text-zinc-900 uppercase">Silver</span>
            </div>
          </div>
        )}

        {/* 1st Place (Center, Tallest Gold Stand) */}
        {first && (
          <div className="flex-1 flex flex-col items-center -mt-4">
            <Crown className="w-8 h-8 text-[#ffb800] fill-[#ffb800] animate-bounce mb-0.5 filter drop-shadow" />
            <span className="text-4xl mb-1 filter drop-shadow">{first.avatar}</span>
            <span className="font-black text-sm text-zinc-950 truncate max-w-24">
              {first.name}
            </span>
            <span className="text-xs font-black text-[#ff5500] mb-1.5">{first.score} pts</span>
            <div className="w-full h-32 bg-gradient-to-b from-[#ffc42e] to-[#ff9900] rounded-t-2xl border-3 border-zinc-950 flex flex-col items-center justify-center shadow-[4px_4px_0px_#121316]">
              <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-zinc-900 flex items-center justify-center mb-1 shadow-sm">
                <Trophy className="w-5 h-5 text-amber-800" />
              </div>
              <span className="font-black text-base text-zinc-950 uppercase">1st Gold</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1 filter drop-shadow">{third.avatar}</span>
            <span className="font-extrabold text-xs text-zinc-900 truncate max-w-20">
              {third.name}
            </span>
            <span className="text-[11px] font-bold text-zinc-600 mb-1.5">{third.score} pts</span>
            <div className="w-full h-20 bg-gradient-to-b from-amber-600 to-amber-800 text-white rounded-t-2xl border-3 border-zinc-950 flex flex-col items-center justify-center shadow-[3px_3px_0px_#121316]">
              <div className="w-7 h-7 rounded-full bg-amber-700 border-2 border-zinc-900 flex items-center justify-center mb-1">
                <span className="font-black text-xs text-amber-100">3</span>
              </div>
              <span className="font-black text-xs text-amber-100 uppercase">Bronze</span>
            </div>
          </div>
        )}
      </div>

      {/* Remaining Players Standings */}
      {remainingPlayers.length > 0 && (
        <div className="dub-card-charcoal p-3 mb-5 text-left">
          <div className="space-y-1.5">
            {remainingPlayers.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#121316] border border-zinc-800 text-zinc-300 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center text-zinc-500 font-black">#{idx + 4}</span>
                  <span>{player.avatar}</span>
                  <span className="font-bold">{player.name}</span>
                </div>
                <span className="font-black text-zinc-400">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-4 rounded-2xl dub-btn-orange flex items-center justify-center gap-2 text-sm font-black shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Play Another Match!</span>
        </button>

        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            className="w-full py-2.5 px-4 rounded-xl bg-white border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-100 text-xs font-black shadow-[2px_2px_0px_#121316] flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        )}
      </div>
    </div>
  );
}
