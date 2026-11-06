"use client";

import React, { useState } from 'react';
import { GameState, MemeItem, Player } from '@/types/game';
import { Check, X, VolumeX, Eye, Timer } from 'lucide-react';

interface ActorViewProps {
  gameState: GameState;
  currentMeme: MemeItem;
  secondsRemaining: number;
  onRecordGuess: (winnerPlayerId: string) => void;
  onTimeExpired: () => void;
}

export function ActorView({
  gameState,
  currentMeme,
  secondsRemaining,
  onRecordGuess,
}: ActorViewProps) {
  const [showPlayerSelector, setShowPlayerSelector] = useState(false);
  const [noClickedFeedback, setNoClickedFeedback] = useState(false);

  // Other players who can be awarded the point
  const currentActorId = gameState.turnOrder[gameState.currentTurnIndex];
  const guesserCandidates = gameState.players.filter((p) => p.id !== currentActorId);

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

  const handleNoClick = () => {
    setNoClickedFeedback(true);
    setTimeout(() => setNoClickedFeedback(false), 1200);
  };

  const handleSelectWinner = (player: Player) => {
    setShowPlayerSelector(false);
    onRecordGuess(player.id);
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between p-2 sm:p-3 overflow-hidden select-none">
      {/* 1. COMPACT TOP HEADER WITH EMBEDDED DIGITAL TIMER */}
      <div className="flex items-center justify-between gap-2 bg-zinc-950 text-white rounded-xl border-2 border-zinc-900 px-3 py-1 shadow-[2px_2px_0px_#000] shrink-0">
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Acting!
        </span>

        {/* Digital Stopwatch in Header */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black border border-zinc-800">
          <Timer className={`w-3.5 h-3.5 ${timerColor}`} />
          <span className={`font-digital font-black text-2xl tracking-wider leading-none ${timerColor}`}>
            {formattedTime}
          </span>
        </div>

        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
          R{gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {/* 2. AUTO-SCALED CENTER MEME GIF (Fills available space, NO SCROLLING) */}
      <div className="flex-1 min-h-0 my-1.5 relative rounded-2xl border-3 border-zinc-900 bg-zinc-950 overflow-hidden shadow-[3px_3px_0px_#18181b] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentMeme.gifUrl}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Subtle Mute Tag Top Right */}
        <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
          <VolumeX className="w-3 h-3 text-red-400" /> Muted
        </span>

        {/* Acting Clue Overlay at Bottom */}
        <div className="absolute bottom-2 inset-x-2 bg-black/85 backdrop-blur-xs text-amber-200 px-2.5 py-1 rounded-xl border border-white/20 text-center shadow-lg">
          <p className="text-[11px] font-bold leading-tight line-clamp-2">
            🎭 {currentMeme.clue || 'Act out the expressions and movements of this meme!'}
          </p>
        </div>
      </div>

      {/* 3. FIXED BOTTOM "SOMEONE GUESSED?" DECISION AREA (Always 100% visible, ZERO SCROLL) */}
      <div className="bg-white rounded-2xl border-3 border-zinc-900 shadow-[3px_3px_0px_#18181b] p-2 sm:p-2.5 text-center shrink-0">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <h3 className="font-[family-name:var(--font-display)] font-black text-xs sm:text-sm text-zinc-900 uppercase tracking-tight">
            Someone Guessed?
          </h3>
          {noClickedFeedback && (
            <span className="text-[10px] font-bold text-amber-600 animate-bounce">
              Keep acting! 🎭
            </span>
          )}
        </div>

        {/* Large Thumb-Friendly YES and NO Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* YES Button (Green) */}
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="neo-btn bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm sm:text-base py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#18181b]"
          >
            <Check className="w-4 h-4 stroke-[3.5]" />
            YES!
          </button>

          {/* NO Button (Red) */}
          <button
            onClick={handleNoClick}
            className="neo-btn bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-sm sm:text-base py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#18181b]"
          >
            <X className="w-4 h-4 stroke-[3.5]" />
            NO
          </button>
        </div>
      </div>

      {/* Bottom Sheet Modal to Select Winner */}
      {showPlayerSelector && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={() => setShowPlayerSelector(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#18181b] overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="bg-emerald-600 text-white p-3.5 border-b-3 border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block">
                  Point Award
                </span>
                <h4 className="font-[family-name:var(--font-display)] font-black text-base sm:text-lg text-white">
                  Who Guessed It Right?
                </h4>
              </div>
              <button
                onClick={() => setShowPlayerSelector(false)}
                aria-label="Close dialog"
                className="w-7 h-7 rounded-full bg-white text-zinc-900 border-2 border-zinc-900 flex items-center justify-center font-black hover:bg-zinc-100"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Players List */}
            <div className="p-3 bg-amber-50/50 max-h-60 overflow-y-auto space-y-2">
              {guesserCandidates.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-600 font-medium">
                  No other players connected yet!
                </div>
              ) : (
                guesserCandidates.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectWinner(player)}
                    className="w-full neo-btn bg-white hover:bg-emerald-50 text-left p-2.5 rounded-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{player.avatar || '😎'}</span>
                      <div>
                        <p className="font-extrabold text-sm text-zinc-900 group-hover:text-emerald-700">
                          {player.name}
                        </p>
                        <p className="text-[11px] font-semibold text-zinc-400">
                          Score: {player.score} pts
                        </p>
                      </div>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-800 flex items-center justify-center font-black text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      +1
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Cancel Button */}
            <div className="p-2.5 bg-zinc-100 border-t-2 border-zinc-900">
              <button
                onClick={() => setShowPlayerSelector(false)}
                className="w-full py-2 rounded-xl bg-white border-2 border-zinc-900 text-zinc-800 font-bold text-xs hover:bg-zinc-50"
              >
                Cancel (Keep Clock Running)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
