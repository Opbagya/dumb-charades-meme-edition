"use client";

import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { playTimeoutBuzzer, triggerHaptic } from '@/lib/sound';
import { AlertTriangle, ArrowRight, Check, Frown, Users, X } from 'lucide-react';

interface RedTimeoutAlertProps {
  gameState: GameState;
  isActor: boolean;
  onRecordLateGuess: (winnerPlayerId: string) => void;
  onNextTurn: () => void;
}

export function RedTimeoutAlert({
  gameState,
  isActor,
  onRecordLateGuess,
  onNextTurn,
}: RedTimeoutAlertProps) {
  const [showLateGuessModal, setShowLateGuessModal] = useState(false);

  const currentActorId = gameState.turnOrder[gameState.currentTurnIndex];
  const actor = gameState.players.find((p) => p.id === currentActorId);
  const missedMeme = gameState.memes[gameState.currentMemeIndex];
  const guesserCandidates = gameState.players.filter((p) => p.id !== currentActorId);

  useEffect(() => {
    playTimeoutBuzzer();
    triggerHaptic([300, 150, 300]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 animate-timeout-red flex flex-col items-center justify-between p-4 sm:p-6 text-white text-center select-none overflow-y-auto">
      {/* Top Banner */}
      <div className="mt-2 px-4 py-1.5 bg-black/85 rounded-full border-2 border-red-400 text-xs sm:text-sm font-black tracking-wider flex items-center gap-2 shadow-lg">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span>ROUND TIMEOUT</span>
      </div>

      {/* Main Alert Card */}
      <div className="my-auto max-w-sm w-full bg-zinc-950/95 rounded-3xl border-4 border-zinc-900 p-5 shadow-[8px_8px_0px_#000] text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center font-black text-3xl border-3 border-white shadow-lg mb-3">
          <Frown className="w-9 h-9" />
        </div>

        <h2 className="font-[family-name:var(--font-display)] font-black text-3xl sm:text-4xl text-white tracking-tight drop-shadow">
          TIME&apos;S UP!
        </h2>
        <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-red-500/30 border border-red-500 text-red-200 text-xs font-black uppercase tracking-wider">
          Miss? No one gets the point!
        </div>

        {/* Reveal the meme to everyone now that round is over */}
        {missedMeme && (
          <div className="mt-4 p-3 bg-zinc-900 rounded-2xl border-2 border-zinc-800 text-center">
            <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-2">
              The Secret Meme:
            </p>
            <div className="w-full aspect-video max-h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={missedMeme.gifUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Actor Late Guess Override Button */}
        {isActor ? (
          <div className="mt-5 space-y-2.5">
            <button
              onClick={() => setShowLateGuessModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm border-2 border-zinc-950 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex items-center justify-center gap-1.5"
            >
              <span>Wait, Someone Actually Guessed?</span>
            </button>

            <button
              onClick={onNextTurn}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-sm sm:text-base border-3 border-zinc-950 shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex items-center justify-center gap-2"
            >
              <span>Proceed to Next Turn</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        ) : (
          <div className="mt-5 p-3 rounded-xl bg-zinc-900 text-zinc-300 text-xs border border-zinc-800">
            Waiting for <strong className="text-white">{actor?.name}</strong> to advance to the next turn...
          </div>
        )}
      </div>

      {/* Footer safe margin */}
      <div className="mb-2 text-[11px] text-red-200">
        Turn {gameState.currentTurnIndex + 1} of {gameState.turnOrder.length} • Dumb Charades
      </div>

      {/* Late Guess Override Modal */}
      {showLateGuessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 text-zinc-900"
          onClick={() => setShowLateGuessModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#000] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-amber-400 p-3.5 border-b-3 border-zinc-900 flex items-center justify-between">
              <h4 className="font-black text-sm text-zinc-950 uppercase tracking-tight">
                Late Guess Rescue
              </h4>
              <button
                onClick={() => setShowLateGuessModal(false)}
                aria-label="Close dialog"
                className="w-7 h-7 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 space-y-2 max-h-64 overflow-y-auto">
              <p className="text-xs text-zinc-600 font-medium mb-2">
                Did someone guess right before the buzzer ended? Tap their name to give them the point:
              </p>
              {guesserCandidates.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setShowLateGuessModal(false);
                    onRecordLateGuess(player.id);
                  }}
                  className="w-full neo-btn bg-white hover:bg-emerald-50 text-left p-3 rounded-xl flex items-center justify-between"
                >
                  <span className="font-extrabold text-xs text-zinc-900">
                    {player.avatar} {player.name}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Give +1 pt
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
