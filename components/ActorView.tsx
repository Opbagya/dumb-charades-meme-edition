"use client";

import React, { useState } from 'react';
import { GameState, MemeItem, Player } from '@/types/game';
import { Check, X, VolumeX, Eye, Timer, Trophy, Sparkles } from 'lucide-react';
import { DubMascot } from './DubMascot';

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
    ? 'text-[#ffb800]'
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
      {/* 1. TOP HEADER WITH DUBDUB DIGITAL TIMER */}
      <div className="flex items-center justify-between gap-2 bg-[#18191e] border-2 border-zinc-800 text-white rounded-2xl px-3 py-1.5 shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <DubMascot size="sm" />
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#ff5500] tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff5500] animate-ping" />
            Your Turn to Act!
          </span>
        </div>

        {/* Digital Stopwatch Pill */}
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

      {/* 2. CENTER MEME CARD (No scrolling, smooth auto-scaled display) */}
      <div className="flex-1 min-h-0 my-2 relative rounded-3xl border-3 border-[#ff5500] bg-[#121316] overflow-hidden shadow-[0_0_25px_rgba(255,85,0,0.25)] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentMeme.gifUrl}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Top Floating Tags */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          <span className="bg-black/85 backdrop-blur-xs text-[#ffb800] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-zinc-700">
            🤫 Shh! No Talking
          </span>
          <span className="bg-black/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
            <VolumeX className="w-3 h-3 text-red-400" /> Muted
          </span>
        </div>

        {/* Acting Prompt Clue at Bottom */}
        <div className="absolute bottom-2.5 inset-x-2.5 bg-black/90 backdrop-blur-xs text-amber-200 px-3 py-1.5 rounded-2xl border border-white/20 text-center shadow-lg pointer-events-none">
          <p className="text-[11px] font-bold leading-tight line-clamp-2">
            🎭 {currentMeme.clue || 'Act out the expressions and movements of this meme!'}
          </p>
        </div>
      </div>

      {/* 3. TACTILE 3D DECISION BUTTONS */}
      <div className="bg-[#18191e] rounded-2xl border-2 border-zinc-800 p-2.5 text-center shrink-0 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-tight text-white flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb800]" />
            Did someone in the room guess it?
          </span>
          {noClickedFeedback && (
            <span className="text-[10px] font-black text-amber-400 animate-pulse">
              Keep acting! 🎭
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Green Yes Button */}
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="py-3 px-3 rounded-xl dub-btn-green flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black active:translate-y-0.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>YES! GUESSED</span>
          </button>

          {/* Dark Nope Button */}
          <button
            onClick={handleNoClick}
            className="py-3 px-3 rounded-xl dub-btn-dark flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black active:translate-y-0.5"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>NOT YET</span>
          </button>
        </div>
      </div>

      {/* 4. GUESSER SELECTION MODAL */}
      {showPlayerSelector && (
        <div
          onClick={() => setShowPlayerSelector(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#18191e] border-3 border-[#ff5500] shadow-[0_0_35px_rgba(255,85,0,0.35)] p-5 text-center select-none animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mb-2">
              <Trophy className="w-6 h-6" />
            </div>

            <h3 className="font-[family-name:var(--font-display)] font-black text-xl text-white">
              Who Guessed Correctly?
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">
              Tap their name below to award them +1 point!
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {guesserCandidates.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectWinner(player)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#121316] border-2 border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {player.avatar}
                    </span>
                    <div>
                      <span className="text-sm font-black text-white block">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        Current Score: {player.score} pts
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-sm">
                    +1 Pt
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPlayerSelector(false)}
              className="mt-4 w-full py-2.5 rounded-xl dub-btn-dark text-xs font-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
