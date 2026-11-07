"use client";

import React, { useState } from 'react';
import { GameState, Player } from '@/types/game';
import { Check, Users, Play, Share2, ArrowLeft } from 'lucide-react';
import { DubMascot } from './DubMascot';

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
          title: 'Join Dub Charades: Meme Edition Squad!',
          text: `Join our meme squad! Room: ${gameState.roomId}`,
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

  // Compute alphabetical turn order
  const alphabeticalPlayers = [...gameState.players].sort((a, b) =>
    a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
  );

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 space-y-3.5 select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 text-xs font-black text-zinc-900 shadow-[2px_2px_0px_#121316] hover:bg-zinc-100 active:translate-y-0.5 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          <span>Exit Room</span>
        </button>

        {/* Live Pill Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-black uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Squad Active</span>
        </div>
      </div>

      {/* Main Squad Room Card */}
      <div className="dub-card-orange-glow p-4 sm:p-5 text-center relative overflow-hidden">
        {/* Decorative corner mascot badge */}
        <div className="absolute -top-3 -right-3 rotate-12 opacity-90">
          <DubMascot size="sm" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ff5500]/20 border border-[#ff5500]/50 text-[#ff7a1a] text-[10px] font-black uppercase tracking-widest mb-2">
          <span>⚡ Squad Room</span>
          <span className="text-white font-mono">#{gameState.roomId}</span>
        </div>

        <h2 className="font-[family-name:var(--font-display)] font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
          Assemble Your Meme Squad!
        </h2>
        <p className="text-xs text-zinc-400 font-medium mt-1 mb-4 max-w-xs mx-auto">
          Share your room invite with friends. Anyone can join instantly with one tap!
        </p>

        {/* 1-Tap Share Button */}
        <button
          onClick={handleCopyLink}
          className="w-full py-3 px-4 rounded-xl dub-btn-orange flex items-center justify-center gap-2 text-sm font-black active:translate-y-0.5"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-white stroke-[3]" />
              <span>Link Copied! Send to Group Chat</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5 stroke-[2.5]" />
              <span>Share Squad Link with Friends</span>
            </>
          )}
        </button>

        {/* Room Code Badge */}
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-400">
          <span>Or join with code:</span>
          <code className="px-2 py-0.5 rounded-md bg-black/60 border border-zinc-700 text-[#ffb800] font-mono font-black text-xs tracking-wider">
            {gameState.roomId}
          </code>
        </div>
      </div>

      {/* Squad Player Roster */}
      <div className="dub-card-charcoal p-4 text-left">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white tracking-wider">
            <Users className="w-4 h-4 text-[#ff5500]" />
            <span>Squad Roster ({gameState.players.length})</span>
          </div>
          <span className="text-[10px] text-[#ffb800] font-black uppercase">
            Turns: A → Z Order
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {alphabeticalPlayers.map((player, idx) => {
            const isMe = player.id === currentPlayer.id;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-[#ff5500]/15 border-[#ff5500]/60 text-white shadow-sm'
                    : 'bg-[#121316] border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-5 text-center text-[10px] font-black text-zinc-500">
                    #{idx + 1}
                  </span>
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shrink-0">
                    {player.avatar}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-black truncate block">
                      {player.name}
                      {isMe && <span className="text-[#ff5500] ml-1">(You)</span>}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold block">
                      {player.isHost ? '👑 Squad Host' : 'Ready to act'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {player.isHost && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-black uppercase">
                      Host
                    </span>
                  )}
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>

        {gameState.players.length === 1 && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold text-center">
            👋 Invite at least 1 more friend to start the match!
          </div>
        )}
      </div>

      {/* Host Match Launch Area */}
      {isHost ? (
        <div className="space-y-2 pt-1">
          <button
            onClick={onStartGame}
            disabled={gameState.players.length < 1}
            className="w-full py-3.5 px-4 rounded-2xl dub-btn-green flex items-center justify-center gap-2 text-base font-black shadow-lg"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Launch Squad Match!</span>
          </button>
          <p className="text-[10px] text-zinc-500 text-center font-bold">
            Each player will take turn acting out memes while others guess!
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Waiting for Squad Host</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            The host will start the match once everyone is in!
          </p>
        </div>
      )}
    </div>
  );
}
