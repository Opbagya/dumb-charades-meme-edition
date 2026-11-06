"use client";

import React, { useState } from 'react';
import { GameState, MemeItem, Player } from '@/types/game';
import { DigitalTimer } from './DigitalTimer';
import { Check, X, Users, Sparkles, VolumeX, Eye } from 'lucide-react';

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

  const handleNoClick = () => {
    setNoClickedFeedback(true);
    setTimeout(() => setNoClickedFeedback(false), 1200);
  };

  const handleSelectWinner = (player: Player) => {
    setShowPlayerSelector(false);
    onRecordGuess(player.id);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-2 pb-8">
      {/* Turn indicator ribbon */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider border-2 border-zinc-900 shadow-[2px_2px_0px_#18181b]">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          You Are Acting!
        </span>
        <span className="text-xs font-bold text-zinc-600 bg-amber-100/90 border border-zinc-300 px-2.5 py-0.5 rounded-full">
          Round {gameState.currentRound}/{gameState.totalRounds}
        </span>
      </div>

      {/* Reverse Countdown Digital Timer & Meme Container */}
      <div className="w-full space-y-3">
        {/* Digital Countdown Timer */}
        <DigitalTimer secondsRemaining={secondsRemaining} totalSeconds={60} />

        {/* Meme Card with GIF and Secret Clue */}
        <div className="neo-box overflow-hidden bg-white">
          {/* Meme header with mute tag */}
          <div className="bg-zinc-900 text-white px-3 py-2 flex items-center justify-between border-b-2 border-zinc-900">
            <span className="font-extrabold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Secret Meme Card
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
              <VolumeX className="w-3 h-3 text-red-400" /> Muted
            </span>
          </div>

          {/* Meme GIF */}
          <div className="relative aspect-4/3 bg-zinc-950 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentMeme.gifUrl}
              alt=""
              className="w-full h-full object-contain"
            />
          </div>

          {/* Acting Guidance (No Meme Name) */}
          <div className="p-3 bg-amber-50/70 border-t-2 border-zinc-900">
            <div className="p-2.5 bg-white rounded-xl border border-zinc-300">
              <p className="text-[11px] font-black text-red-600 uppercase tracking-wide">
                🎭 Acting Instructions:
              </p>
              <p className="text-xs font-semibold text-zinc-800 leading-snug mt-0.5">
                {currentMeme.clue || 'Mimic the facial expressions, body movements, and gestures of this meme without speaking!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* "Someone Guessed?" Decision Area */}
      <div className="w-full mt-5 p-4 rounded-2xl bg-white border-3 border-zinc-900 shadow-[4px_4px_0px_#18181b] text-center">
        <h3 className="font-[family-name:var(--font-display)] font-black text-lg sm:text-xl text-zinc-900 uppercase tracking-tight">
          Someone Guessed?
        </h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5 mb-3">
          Did a friend shout out the right meme?
        </p>

        {/* YES and NO Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* YES Button (Green) */}
          <button
            onClick={() => setShowPlayerSelector(true)}
            className="neo-btn bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 shadow-[3px_3px_0px_#18181b]"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            YES!
          </button>

          {/* NO Button (Red) */}
          <button
            onClick={handleNoClick}
            className="neo-btn bg-red-600 hover:bg-red-500 text-white font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 shadow-[3px_3px_0px_#18181b]"
          >
            <X className="w-6 h-6 stroke-[3]" />
            NO
          </button>
        </div>

        {noClickedFeedback && (
          <p className="mt-2.5 text-xs font-bold text-amber-700 animate-bounce">
            Keep acting! Exaggerate your moves! 🎭
          </p>
        )}
      </div>

      {/* Bottom Sheet / Modal to Select Who Guessed */}
      {showPlayerSelector && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={() => setShowPlayerSelector(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#18181b] overflow-hidden animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="bg-emerald-600 text-white p-4 border-b-3 border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block">
                  Point Award
                </span>
                <h4 className="font-[family-name:var(--font-display)] font-black text-lg text-white">
                  Who Guessed It Right?
                </h4>
              </div>
              <button
                onClick={() => setShowPlayerSelector(false)}
                aria-label="Close dialog"
                className="w-8 h-8 rounded-full bg-white text-zinc-900 border-2 border-zinc-900 flex items-center justify-center font-black hover:bg-zinc-100"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Players List */}
            <div className="p-4 bg-amber-50/50 max-h-72 overflow-y-auto space-y-2">
              {guesserCandidates.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-600">
                  <p>No other players joined yet!</p>
                  <button
                    onClick={() => {
                      // Solo demo fallback
                      if (gameState.players[0]) handleSelectWinner(gameState.players[0]);
                    }}
                    className="mt-2 text-xs font-bold text-emerald-700 underline"
                  >
                    Award point to self (Demo mode)
                  </button>
                </div>
              ) : (
                guesserCandidates.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectWinner(player)}
                    className="w-full neo-btn bg-white hover:bg-emerald-50 text-left p-3 rounded-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
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
                    <span className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-800 flex items-center justify-center font-black text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      +1
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Cancel Button */}
            <div className="p-3 bg-zinc-100 border-t-2 border-zinc-900">
              <button
                onClick={() => setShowPlayerSelector(false)}
                className="w-full py-2.5 rounded-xl bg-white border-2 border-zinc-900 text-zinc-800 font-bold text-xs hover:bg-zinc-50"
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
