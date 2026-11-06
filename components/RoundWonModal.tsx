"use client";

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '@/types/game';
import { playVictoryFanfare, triggerHaptic } from '@/lib/sound';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';

interface RoundWonModalProps {
  gameState: GameState;
  currentPlayerId: string;
  isActor: boolean;
  onNextTurn: () => void;
}

export function RoundWonModal({
  gameState,
  currentPlayerId,
  isActor,
  onNextTurn,
}: RoundWonModalProps) {
  const isWinner = gameState.lastWinnerId === currentPlayerId;
  const winner = gameState.players.find((p) => p.id === gameState.lastWinnerId);
  const guessedMeme = gameState.lastGuessedMeme || gameState.memes[gameState.currentMemeIndex];

  useEffect(() => {
    // Play fanfare sound
    playVictoryFanfare();
    triggerHaptic([100, 50, 100, 50, 200]);

    // Launch confetti! Extra celebratory if this user is the winner
    if (isWinner) {
      // Massive dual side burst
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#dc2626', '#22c55e', '#eab308', '#3b82f6', '#ec4899'];

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Moderate room confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 text-center select-none overflow-y-auto">
      <div className="max-w-sm w-full bg-white rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#000] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className={`p-4 border-b-3 border-zinc-900 text-white ${isWinner ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-600'}`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            {isWinner ? 'Victory for You!' : 'Point Scored!'}
          </div>
          <h3 className="font-[family-name:var(--font-display)] font-black text-2xl tracking-tight">
            {isWinner ? '🎉 YOU GUESSED IT!' : `${winner?.name || 'Player'} Guessed Right!`}
          </h3>
          <p className="text-xs font-bold opacity-90 mt-0.5">
            +1 Point awarded on the leaderboard!
          </p>
        </div>

        {/* Guessed Meme Card (No Name) */}
        <div className="p-4 bg-amber-50/60">
          {guessedMeme && (
            <div className="rounded-2xl border-2 border-zinc-900 bg-white overflow-hidden shadow-[3px_3px_0px_#18181b]">
              <div className="aspect-video bg-zinc-900 overflow-hidden relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guessedMeme.gifUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Action Button: Next Turn */}
          <button
            onClick={onNextTurn}
            className="w-full mt-4 neo-btn bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#18181b]"
          >
            <span>Next Turn</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
