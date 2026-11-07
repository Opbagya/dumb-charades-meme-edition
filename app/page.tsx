"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameState, Player } from '@/types/game';
import { CLASSIC_MEMES } from '@/lib/memes';
import { RoomMultiplayer } from '@/lib/multiplayer';
import { MemeCarousel } from '@/components/MemeCarousel';
import { LobbyView } from '@/components/LobbyView';
import { GreenTurnAlert } from '@/components/GreenTurnAlert';
import { ActorView } from '@/components/ActorView';
import { GuesserView } from '@/components/GuesserView';
import { RedTimeoutAlert } from '@/components/RedTimeoutAlert';
import { RoundWonModal } from '@/components/RoundWonModal';
import { LeaderboardPodium } from '@/components/LeaderboardPodium';
import { DubMascot } from '@/components/DubMascot';
import {
  Users,
  Play,
  Sparkles,
  Smile,
  Flame,
  ArrowRight,
  HelpCircle,
  X,
  Volume2,
  Trophy,
} from 'lucide-react';

const AVATAR_OPTIONS = ['😎', '🤡', '🤪', '🐱', '🐸', '🐶', '🍕', '🚀', '🎭', '👑', '🔥', '👀'];

function DumbCharadesGame() {
  const searchParams = useSearchParams();

  // Local player identity
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('😎');
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [invitedRoomCode, setInvitedRoomCode] = useState<string | null>(null);
  const [showManualCodeInput, setShowManualCodeInput] = useState<boolean>(false);

  // Room & game state
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active round timer
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Realtime multiplayer manager via Supabase
  const multiplayerRef = useRef<RoomMultiplayer | null>(null);

  // Direct join function (reusable for auto-join or 1-tap join)
  const joinRoomDirect = useCallback((code: string, pId: string, pName: string, pAvatar: string) => {
    if (!pName.trim()) {
      setErrorMsg('Please enter your player name first!');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const cleanCode = code.toUpperCase().trim();
    localStorage.setItem('dc_player_name', pName.trim());
    localStorage.setItem('dc_player_avatar', pAvatar);

    const joiningPlayer: Player = {
      id: pId,
      name: pName.trim(),
      avatar: pAvatar,
      score: 0,
      joinedAt: Date.now(),
      isHost: false,
    };

    try {
      multiplayerRef.current?.destroy();
      const mp = new RoomMultiplayer(cleanCode, joiningPlayer, {
        onStateUpdate: (updated) => setGameState(updated),
      });
      mp.connect();
      multiplayerRef.current = mp;
      setCurrentRoomId(cleanCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error joining room';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize player identity & auto-join if link received
  useEffect(() => {
    let id = localStorage.getItem('dc_player_id');
    if (!id) {
      id = `p_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('dc_player_id', id);
    }
    setPlayerId(id);

    const savedName = localStorage.getItem('dc_player_name') || '';
    if (savedName) setPlayerName(savedName);

    const savedAvatar = localStorage.getItem('dc_player_avatar') || '😎';
    if (savedAvatar) setPlayerAvatar(savedAvatar);

    // Check URL for room code
    const queryRoom = searchParams.get('room');
    if (queryRoom) {
      const cleanCode = queryRoom.toUpperCase().trim();
      setInvitedRoomCode(cleanCode);
      setRoomCodeInput(cleanCode);

      if (savedName.trim() && !currentRoomId) {
        joinRoomDirect(cleanCode, id, savedName.trim(), savedAvatar);
      }
    }
  }, [searchParams, currentRoomId, joinRoomDirect]);

  // Synchronize room state
  const fetchRoomState = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/room/${roomId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.room) {
        setGameState(data.room);
      }
    } catch {
      // Polling fallback
    }
  }, []);

  // Polling fallback interval
  useEffect(() => {
    if (!currentRoomId) return;
    fetchRoomState(currentRoomId);
    const interval = setInterval(() => {
      fetchRoomState(currentRoomId);
    }, 1200);
    return () => clearInterval(interval);
  }, [currentRoomId, fetchRoomState]);

  // Active round countdown tick
  useEffect(() => {
    if (!gameState || gameState.status !== 'acting' || !gameState.roundEndsAt) return;

    const interval = setInterval(() => {
      const msLeft = gameState.roundEndsAt! - Date.now();
      const secs = Math.max(0, Math.ceil(msLeft / 1000));
      setSecondsRemaining(secs);

      if (secs <= 0) {
        const currentActorId = gameState.turnOrder[gameState.currentTurnIndex];
        if (currentActorId === playerId) {
          handleAction('timeout');
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [gameState, playerId]);

  // Cleanup multiplayer connection on unmount
  useEffect(() => {
    return () => {
      multiplayerRef.current?.destroy();
    };
  }, []);

  // Execute Room actions via Supabase Realtime
  const handleAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!currentRoomId) return;

    const mp = multiplayerRef.current;
    if (mp) {
      switch (action) {
        case 'start':
          mp.startGame();
          break;
        case 'start_acting':
          mp.startActing();
          break;
        case 'guess':
          if (extra.winnerId) mp.recordGuess(extra.winnerId as string);
          break;
        case 'timeout':
          mp.timeout();
          break;
        case 'next_turn':
          mp.nextTurn();
          break;
        case 'restart':
          mp.restartGame();
          break;
      }
    }

    try {
      fetch(`/api/room/${currentRoomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId,
          playerName,
          playerAvatar,
          ...extra,
        }),
      }).catch(() => {});
    } catch {
      // Ignore background sync errors
    }
  };

  // Create Room
  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your player name first!');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const generatedCode = `DUB${Math.floor(100 + Math.random() * 900)}`;
    localStorage.setItem('dc_player_name', playerName.trim());
    localStorage.setItem('dc_player_avatar', playerAvatar);

    const hostPlayer: Player = {
      id: playerId,
      name: playerName.trim(),
      avatar: playerAvatar,
      score: 0,
      joinedAt: Date.now(),
      isHost: true,
    };

    try {
      multiplayerRef.current?.destroy();
      const mp = new RoomMultiplayer(generatedCode, hostPlayer, {
        onStateUpdate: (updated) => setGameState(updated),
      });
      mp.connect();
      multiplayerRef.current = mp;
      setCurrentRoomId(generatedCode);

      fetch(`/api/room/${generatedCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId,
          playerName: playerName.trim(),
          playerAvatar,
          deckMode: 'classic',
        }),
      }).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating room';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Join Room with input code
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your player name first!');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg('Please enter a squad room code!');
      return;
    }
    joinRoomDirect(roomCodeInput, playerId, playerName, playerAvatar);
  };

  // Leave room back to landing
  const handleLeaveRoom = () => {
    multiplayerRef.current?.destroy();
    multiplayerRef.current = null;
    setCurrentRoomId(null);
    setGameState(null);
    setInvitedRoomCode(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleLeaveRoomConfirm = () => {
    if (gameState && gameState.status !== 'lobby' && gameState.status !== 'game_over') {
      if (window.confirm('Are you sure you want to leave this match and return home?')) {
        handleLeaveRoom();
      }
    } else {
      handleLeaveRoom();
    }
  };

  const currentPlayer = gameState?.players.find((p) => p.id === playerId) || {
    id: playerId,
    name: playerName || 'Player',
    avatar: playerAvatar,
    score: 0,
    joinedAt: Date.now(),
    isHost: false,
  };

  const currentActorId =
    gameState && gameState.turnOrder.length > 0
      ? gameState.turnOrder[gameState.currentTurnIndex % gameState.turnOrder.length]
      : null;
  const isCurrentActor = currentActorId === playerId;
  const currentActor = gameState?.players.find((p) => p.id === currentActorId);
  const currentMeme =
    gameState?.memes[gameState.currentMemeIndex % (gameState.memes.length || 1)] ||
    CLASSIC_MEMES[0];

  const isPlayingGame = !!(
    gameState &&
    (gameState.status === 'acting' ||
      gameState.status === 'countdown' ||
      gameState.status === 'timeout' ||
      gameState.status === 'round_won')
  );

  return (
    <div
      className={`min-h-[100dvh] ${
        isPlayingGame ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : ''
      } bg-dub-grid text-[#121316] flex flex-col justify-between selection:bg-[#ff5500] selection:text-white`}
    >
      {/* TOP DUBDUB STYLE BAR */}
      <header
        className={`w-full bg-[#121316] border-b-2 sm:border-b-3 border-zinc-950 ${
          isPlayingGame ? 'py-1 sm:py-1.5 px-3' : 'py-2.5 sm:py-3 px-4'
        } shadow-md relative overflow-hidden shrink-0 select-none`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <DubMascot size="sm" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-2xl text-white tracking-wide uppercase leading-none">
                  DUMB CHARADES
                </h1>
                <span className="px-1.5 py-0.5 bg-[#ff5500] text-white rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  MEME EDITION
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-bold hidden sm:block">
                The Single Real-Time Meme Charades Party Game
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="px-2.5 py-1.5 bg-[#18191e] hover:bg-[#242630] rounded-xl border border-zinc-700 text-xs font-black text-white flex items-center gap-1 shadow-sm active:translate-y-0.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#ffb800]" />
              <span>Rules</span>
            </button>

            {gameState && (
              <button
                onClick={handleLeaveRoomConfirm}
                className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl border border-red-500 text-xs font-black shadow-sm active:translate-y-0.5 transition-transform"
              >
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 min-h-0 max-w-xl w-full mx-auto ${
          isPlayingGame ? 'overflow-hidden flex flex-col p-0' : 'pb-10 p-3.5 sm:p-5'
        }`}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: LANDING PAGE (NO ACTIVE ROOM) */}
        {/* ========================================================================= */}
        {!gameState && (
          <div className="space-y-4">
            {/* INVITATION MODE: Directly launch with 1 click after receiving link */}
            {invitedRoomCode ? (
              <div className="dub-card-orange-glow p-5 sm:p-6 space-y-4 text-center">
                <DubMascot size="md" withSpeechBubble="JOIN SQUAD! 🚀" className="mx-auto" />
                <div>
                  <span className="inline-block px-3 py-0.5 rounded-full bg-[#ff5500]/20 text-[#ff7a1a] border border-[#ff5500]/40 text-xs font-black uppercase tracking-wider mb-1">
                    🎮 Squad Invite #{invitedRoomCode}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-white">
                    You&apos;re Invited to Play!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Enter your name and pick your meme avatar to jump into the match.
                  </p>
                </div>

                {/* Name Input */}
                <div className="text-left">
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Maya, Jordan, Alex..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-700 text-sm font-bold bg-[#121316] text-white focus:outline-hidden focus:border-[#ff5500]"
                  />
                </div>

                {/* Avatar Selector */}
                <div className="text-left">
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Choose Your Meme Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPlayerAvatar(emoji)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-transform ${
                          playerAvatar === emoji
                            ? 'border-[#ff5500] bg-[#ff5500]/30 scale-110 shadow-[0_0_10px_rgba(255,85,0,0.5)]'
                            : 'border-zinc-800 bg-[#121316] hover:bg-zinc-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500 text-red-300 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => joinRoomDirect(invitedRoomCode, playerId, playerName, playerAvatar)}
                    className="w-full py-3.5 rounded-2xl dub-btn-orange text-base font-black flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Join Squad Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInvitedRoomCode(null);
                      if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', window.location.pathname);
                      }
                    }}
                    className="w-full py-2 text-zinc-400 hover:text-white text-xs font-bold"
                  >
                    Or create your own squad instead
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* DubDub Signature Hero Card */}
                <div className="dub-card-charcoal pt-6 pb-4 px-4 text-center relative overflow-visible">
                  <div className="flex justify-center mb-1.5">
                    <DubMascot size="lg" withSpeechBubble="NO TALKING! 🤫" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ff5500]/20 border border-[#ff5500]/40 text-[#ff7a1a] text-[10px] font-black uppercase tracking-widest mb-1.5">
                    <span>⚡ CHOOSE • SWIPE • ACT • WIN</span>
                  </div>

                  <h2 className="font-[family-name:var(--font-display)] font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                    Act Out The Internet&apos;s Most Legendary Memes!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Play in person with your friends. Secret turn notifications, 60s timer, live duel race tracks, and 3D podiums.
                  </p>
                </div>

                {/* Meme Vault Carousel Preview */}
                <MemeCarousel />

                {/* Player Setup & Room Actions */}
                <div className="dub-card-cream p-4 sm:p-5 space-y-3.5">
                  <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 border-b border-zinc-200 pb-2 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-[#ff5500]" />
                    <span>Step 1: Your Name & Avatar</span>
                  </h3>

                  {/* Name Input */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya, Jordan, Sam..."
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-900 text-sm font-bold bg-zinc-50 focus:bg-white focus:outline-hidden focus:border-[#ff5500]"
                    />
                  </div>

                  {/* Avatar Selector */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                      Choose Your Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setPlayerAvatar(emoji)}
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg transition-transform ${
                            playerAvatar === emoji
                              ? 'border-zinc-950 bg-[#ff5500] text-white scale-110 shadow-[2px_2px_0px_#121316]'
                              : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-red-100 border border-red-500 text-red-700 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Step 2 Actions */}
                  <div className="pt-2 space-y-2">
                    <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff5500]" />
                      <span>Step 2: Choose Room Action</span>
                    </h3>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleCreateRoom}
                      className="w-full py-3.5 px-4 rounded-xl dub-btn-orange text-sm font-black flex items-center justify-center gap-2"
                    >
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Create New Squad Room</span>
                    </button>

                    {!showManualCodeInput ? (
                      <button
                        type="button"
                        onClick={() => setShowManualCodeInput(true)}
                        className="w-full py-2.5 px-4 rounded-xl dub-btn-dark text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Join Existing Squad with Code</span>
                      </button>
                    ) : (
                      <form onSubmit={handleJoinRoom} className="space-y-2 pt-1 animate-in fade-in">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. DUB482"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            maxLength={8}
                            className="flex-1 px-3 py-2 rounded-xl border-2 border-zinc-900 text-xs font-mono font-black uppercase text-center bg-zinc-50 focus:bg-white"
                          />
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-xl dub-btn-green text-xs font-black"
                          >
                            Join
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: LOBBY VIEW */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'lobby' && (
          <LobbyView
            gameState={gameState}
            currentPlayer={currentPlayer}
            onStartGame={() => handleAction('start')}
            onLeaveRoom={handleLeaveRoomConfirm}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: 3-SECOND COUNTDOWN TURN ALERT */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'countdown' && (
          <GreenTurnAlert
            isActor={isCurrentActor}
            actorName={currentActor?.name || 'Someone'}
            countdownEndsAt={gameState.countdownEndsAt}
            onCountdownComplete={() => {
              if (isCurrentActor) {
                handleAction('start_acting');
              }
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ACTIVE CHARADES ROUND (ACTOR VIEW vs GUESSER VIEW) */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'acting' && (
          isCurrentActor ? (
            <ActorView
              gameState={gameState}
              currentMeme={currentMeme}
              secondsRemaining={secondsRemaining}
              onRecordGuess={(winnerId) => handleAction('guess', { winnerId })}
              onTimeExpired={() => handleAction('timeout')}
            />
          ) : (
            <GuesserView
              gameState={gameState}
              secondsRemaining={secondsRemaining}
            />
          )
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: ROUND WON OVERLAY MODAL */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'round_won' && (
          <RoundWonModal
            gameState={gameState}
            currentPlayerId={playerId}
            isActor={isCurrentActor}
            onNextTurn={() => handleAction('next_turn')}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: TIMEOUT ALERT OVERLAY */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'timeout' && (
          <RedTimeoutAlert
            gameState={gameState}
            isActor={isCurrentActor}
            onRecordLateGuess={(winnerId) => handleAction('guess', { winnerId })}
            onNextTurn={() => handleAction('next_turn')}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 7: GAME OVER / FINAL PODIUM */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'game_over' && (
          <LeaderboardPodium
            gameState={gameState}
            onRestart={() => handleAction('restart')}
            onLeaveRoom={handleLeaveRoomConfirm}
          />
        )}
      </main>

      {/* HOW TO PLAY / RULES MODAL */}
      {showHowToPlay && (
        <div
          onClick={() => setShowHowToPlay(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#18191e] border-3 border-[#ff5500] shadow-[0_0_35px_rgba(255,85,0,0.35)] p-5 text-left text-white animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <DubMascot size="sm" />
                <h3 className="font-[family-name:var(--font-display)] font-black text-xl text-white">
                  How to Play Dub Charades
                </h3>
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#121316] border border-zinc-800 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#ff5500] text-white flex items-center justify-center font-black shrink-0">
                  1
                </span>
                <div>
                  <span className="font-black text-white block">Gather in Real Life</span>
                  <p className="text-zinc-400 mt-0.5">
                    Share your squad link with friends in the same room. Everyone joins on their own phone!
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#121316] border border-zinc-800 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">
                  2
                </span>
                <div>
                  <span className="font-black text-emerald-400 block">Watch for Green Blink</span>
                  <p className="text-zinc-400 mt-0.5">
                    Turns rotate alphabetically (A → Z). When your screen pulses green, turn your phone away—you are the Actor!
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#121316] border border-zinc-800 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#ffb800] text-zinc-950 flex items-center justify-center font-black shrink-0">
                  3
                </span>
                <div>
                  <span className="font-black text-[#ffb800] block">Act Without Talking</span>
                  <p className="text-zinc-400 mt-0.5">
                    Act out the expressions and movements of the secret meme within 60 seconds. Strictly no talking or whispering!
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#121316] border border-zinc-800 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center font-black shrink-0">
                  4
                </span>
                <div>
                  <span className="font-black text-purple-300 block">Shout & Win Points</span>
                  <p className="text-zinc-400 mt-0.5">
                    Guessers shout answers out loud. When someone gets it, the Actor taps &ldquo;YES! GUESSED&rdquo; and awards the point!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-4 w-full py-2.5 rounded-xl dub-btn-orange text-xs font-black"
            >
              Got It, Let&apos;s Play!
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full py-2.5 text-center text-[11px] text-zinc-500 font-bold border-t border-zinc-200 select-none bg-white/60 shrink-0">
        <div className="max-w-xl mx-auto flex items-center justify-between px-4">
          <span>Dumb Charades: Meme Edition</span>
          <span className="text-[#ff5500]">Powered by Supabase Realtime</span>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121316] flex items-center justify-center text-white font-black text-sm">Loading Squad...</div>}>
      <DumbCharadesGame />
    </Suspense>
  );
}
