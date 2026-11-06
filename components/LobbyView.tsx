"use client";

import React, { useState } from 'react';
import { DeckMode, GameState, Player } from '@/types/game';
import { Copy, Check, Users, Play, Sparkles, Share2, Crown, SlidersHorizontal, Settings2, ArrowLeft } from 'lucide-react';

interface LobbyViewProps {
  gameState: GameState;
  currentPlayer: Player;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function LobbyView({
  gameState,
  currentPlayer,
  onStartGame,
  onLeaveRoom,
}: LobbyViewProps) {
  const [copied, setCopied] = useState(false);
  const isHost = currentPlayer.isHost;

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}?room=${gameState.roomId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Dumb Charades: Meme Edition!',
          text: `Join our Dumb Charades game! Room code: ${gameState.roomId}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Preview alphabetical turn order
  const alphabeticalPlayers = [...gameState.players].sort((a, b) =>
    a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
  );

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 text-xs font-black text-zinc-900 shadow-[2px_2px_0px_#18181b] hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 transition-transform"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-bold text-zinc-500">
          Room: <strong className="font-mono text-zinc-900">{gameState.roomId}</strong>
        </span>
      </div>

      {/* Room Code Card with Retro Stamp */}
      <div className="neo-box bg-white p-4 sm:p-5 text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
            Game Room
          </span>
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-700" />
            {gameState.players.length} {gameState.players.length === 1 ? 'Player' : 'Players'}
          </span>
        </div>

        <div className="my-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
            Room Code
          </span>
          <h2 className="font-mono font-black text-4xl sm:text-5xl text-zinc-950 tracking-wider">
            {gameState.roomId}
          </h2>
        </div>

        <button
          onClick={handleCopyLink}
          className="w-full mt-3 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm border-2 border-zinc-900 shadow-[3px_3px_0px_#18181b] flex items-center justify-center gap-2 active:translate-x-0.5 active:translate-y-0.5 transition-transform"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
              <span>Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Invite Friends (Share Link)</span>
            </>
          )}
        </button>
      </div>

      {/* Players Lobby & Alphabetical Order */}
      <div className="neo-box bg-white p-4">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-200 pb-2">
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Players in Room
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">
              Turns go in <strong>Alphabetical Order</strong>
            </p>
          </div>
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
            A &rarr; Z Turn Order
          </span>
        </div>

        <div className="space-y-2">
          {alphabeticalPlayers.map((player, idx) => {
            const isMe = player.id === currentPlayer.id;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${
                  isMe
                    ? 'border-zinc-900 bg-amber-50 shadow-[2px_2px_0px_#18181b]'
                    : 'border-zinc-200 bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-2xl">{player.avatar || '😎'}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-black text-xs sm:text-sm text-zinc-900">
                        {player.name}
                      </p>
                      {player.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      )}
                      {isMe && (
                        <span className="text-[9px] font-bold bg-zinc-900 text-white px-1.5 py-0.2 rounded-sm">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {idx === 0 ? 'Acts 1st' : `Acts #${idx + 1}`}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-zinc-400">
                  {player.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Start Game Action */}
      <div className="pt-2">
        {isHost ? (
          <button
            onClick={onStartGame}
            className="w-full neo-btn bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-[5px_5px_0px_#18181b]"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>START GAME NOW</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-900 text-white text-center border-2 border-zinc-800 shadow-md">
            <p className="font-black text-xs text-amber-400 uppercase tracking-wider mb-1">
              Ready to Play!
            </p>
            <p className="text-xs text-zinc-300">
              Waiting for the host to press Start Game...
            </p>
          </div>
        )}

        {/* Leave Room Secondary Link */}
        <div className="pt-3 text-center">
          <button
            onClick={onLeaveRoom}
            className="text-xs font-bold text-zinc-500 hover:text-red-700 underline"
          >
            Leave Room & Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
