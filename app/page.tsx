"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DeckMode, GameState, MemeItem, Player } from '@/types/game';
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
} from 'lucide-react';

const AVATAR_OPTIONS = ['😎', '🤡', '🤪', '🐱', '🐸', '🐶', '🍕', '🚀', '🎭', '👑', '🔥', '👀'];

function DumbCharadesGame() {
  const searchParams = useSearchParams();

  // Local user state
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

  // Realtime multiplayer manager (like roadsterdash via Supabase Realtime)
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

      // If user already has a saved name, auto-join immediately!
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
      const data = await fetchRoomStateJson(res);
      if (data?.room) {
        setGameState(data.room);
      }
    } catch {
      // Background poll silently retry
    }
  }, []);

  async function fetchRoomStateJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  // Room polling interval
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

      // Timeout detection: Actor reports timeout to room
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

  // Execute Room actions via Supabase Realtime (with HTTP fallback)
  const handleAction = async (
    action: string,
    extra: Record<string, unknown> = {}
  ) => {
    if (!currentRoomId) return;

    // 1. Instant Realtime broadcast via Supabase (sub-50ms across phones)
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

    // 2. Also notify API route if running with server
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

    const generatedCode = `MEME${Math.floor(100 + Math.random() * 900)}`;
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
      // Initialize Supabase Realtime Broadcast room
      multiplayerRef.current?.destroy();
      const mp = new RoomMultiplayer(generatedCode, hostPlayer, {
        onStateUpdate: (updated) => setGameState(updated),
      });
      mp.connect();
      multiplayerRef.current = mp;

      setCurrentRoomId(generatedCode);

      // Also register on local API if available
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

  // Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Please enter your player name first!');
      return;
    }
    if (!roomCodeInput.trim()) {
      setErrorMsg('Please enter a 6-letter room code!');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const cleanCode = roomCodeInput.toUpperCase().trim();
    localStorage.setItem('dc_player_name', playerName.trim());
    localStorage.setItem('dc_player_avatar', playerAvatar);

    const joiningPlayer: Player = {
      id: playerId,
      name: playerName.trim(),
      avatar: playerAvatar,
      score: 0,
      joinedAt: Date.now(),
      isHost: false,
    };

    try {
      // Connect to Supabase Realtime Broadcast room
      multiplayerRef.current?.destroy();
      const mp = new RoomMultiplayer(cleanCode, joiningPlayer, {
        onStateUpdate: (updated) => setGameState(updated),
      });
      mp.connect();
      multiplayerRef.current = mp;

      setCurrentRoomId(cleanCode);

      // Also notify API route if available
      fetch(`/api/room/${cleanCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          playerId,
          playerName: playerName.trim(),
          playerAvatar,
        }),
      }).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error joining room';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
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
      if (window.confirm('Are you sure you want to leave this game and return to the home screen?')) {
        handleLeaveRoom();
      }
    } else {
      handleLeaveRoom();
    }
  };

  // Determine current player object
  const currentPlayer = gameState?.players.find((p) => p.id === playerId) || {
    id: playerId,
    name: playerName || 'Player',
    avatar: playerAvatar,
    score: 0,
    joinedAt: Date.now(),
    isHost: false,
  };

  // Determine who the actor is
  const currentActorId =
    gameState && gameState.turnOrder.length > 0
      ? gameState.turnOrder[gameState.currentTurnIndex % gameState.turnOrder.length]
      : null;
  const isCurrentActor = currentActorId === playerId;
  const currentActor = gameState?.players.find((p) => p.id === currentActorId);
  const currentMeme =
    gameState?.memes[gameState.currentMemeIndex % (gameState.memes.length || 1)] ||
    CLASSIC_MEMES[0];

  // Active game mode check to lock viewport and eliminate all scroll
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
      } bg-[var(--cream)] text-zinc-900 flex flex-col justify-between selection:bg-red-600 selection:text-white`}
    >
      {/* TOP DECORATIVE BANNER: Upgraded stylized party title */}
      <div
        className={`w-full bg-wavy-checker border-b-2 sm:border-b-4 border-zinc-900 ${
          isPlayingGame ? 'py-1 sm:py-1.5 px-3' : 'py-2.5 sm:py-3.5 px-4'
        } shadow-md relative overflow-hidden shrink-0`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-300 border-3 border-zinc-950 shadow-[3px_3px_0px_#000] flex items-center justify-center text-xl sm:text-2xl shrink-0 -rotate-3 hover:rotate-0 transition-transform">
              🤡
            </span>
            <div className="flex flex-col">
              <h1 className="font-[family-name:var(--font-display)] text-lg sm:text-2xl text-white tracking-wide uppercase leading-none [text-shadow:_2px_2px_0px_#000,_-1px_-1px_0px_#000,_1px_-1px_0px_#000,_-1px_1px_0px_#000,_3px_3px_0px_#000]">
                DUMB CHARADES
              </h1>
              <div className="mt-1 flex items-center">
                <span className="inline-block px-1.5 py-0.2 bg-amber-300 text-zinc-950 rounded-md border-2 border-zinc-950 text-[9px] sm:text-[10px] font-[family-name:var(--font-display)] uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000] -rotate-1">
                  ⚡ MEME EDITION
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="px-2.5 py-1.5 bg-white/95 rounded-xl border-2 border-zinc-900 text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_#000] hover:bg-zinc-100"
            >
              <HelpCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Rules</span>
            </button>

            {gameState && (
              <button
                onClick={handleLeaveRoomConfirm}
                className="px-3 py-1.5 bg-zinc-900 text-white rounded-xl border-2 border-zinc-900 text-xs font-black shadow-[2px_2px_0px_#000] hover:bg-zinc-800 active:translate-x-0.5 active:translate-y-0.5 transition-transform flex items-center gap-1"
              >
                <span>← Exit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 min-h-0 max-w-xl w-full mx-auto ${
          isPlayingGame ? 'overflow-hidden flex flex-col p-0' : 'pb-10 p-4 sm:p-6'
        }`}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: LANDING PAGE (NO ACTIVE ROOM) */}
        {/* ========================================================================= */}
        {!gameState && (
          <div className="p-4 sm:p-6 space-y-6">
            {/* INVITATION MODE: Directly launch with 1 click after receiving link */}
            {invitedRoomCode ? (
              <div className="neo-box bg-white p-5 sm:p-6 space-y-4">
                <div className="text-center">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                    🎮 Game Invite
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] font-black text-2xl text-zinc-950">
                    You&apos;re Invited to Play!
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    Enter your name and pick an avatar to jump straight into the party.
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Maya, Jordan, Alex..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-3 border-zinc-900 text-sm font-bold bg-zinc-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Avatar Selector */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                    Choose Your Meme Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setPlayerAvatar(emoji)}
                        className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg transition-transform ${
                          playerAvatar === emoji
                            ? 'border-zinc-900 bg-amber-300 scale-110 shadow-[2px_2px_0px_#000]'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => joinRoomDirect(invitedRoomCode, playerId, playerName, playerAvatar)}
                    className="w-full neo-btn bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000]"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>Join Game Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInvitedRoomCode(null);
                      if (typeof window !== 'undefined') {
                        window.history.replaceState({}, '', window.location.pathname);
                      }
                    }}
                    className="w-full py-2 text-zinc-500 hover:text-zinc-800 text-xs font-bold"
                  >
                    Or create your own game instead
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Hero Card */}
                <div className="neo-box bg-white p-5 text-center relative overflow-hidden">
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full mb-3 border-2 border-zinc-900 shadow-[2px_2px_0px_#000]">
                    🔥 The In-Person Party Game
                  </span>
                  <h2 className="font-[family-name:var(--font-display)] font-black text-2xl sm:text-3xl text-zinc-950 tracking-tight leading-tight">
                    Act Out The Internet&apos;s Most Legendary Memes!
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Play on mobile with friends in real life. Turns go in alphabetical order—when your phone blinks green, it&apos;s your secret turn to act!
                  </p>
                </div>

                {/* Meme Hall of Fame Horizontal Scrolling Carousel */}
                <MemeCarousel />

                {/* Player Setup & Room Action Card */}
                <div className="neo-box bg-white p-5 sm:p-6 space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-200 pb-2 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-500" />
                    Step 1: Your Name & Avatar
                  </h3>

                  {/* Name Input */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      Enter Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya, Jordan, Sam..."
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-3 border-zinc-900 text-sm font-bold bg-zinc-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
                    />
                  </div>

                  {/* Avatar Selector */}
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                      Pick Your Meme Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setPlayerAvatar(emoji)}
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg transition-transform ${
                            playerAvatar === emoji
                              ? 'border-zinc-900 bg-amber-300 scale-110 shadow-[2px_2px_0px_#000]'
                              : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 rounded-xl bg-red-100 border-2 border-red-600 text-red-700 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}

                  {/* Direct Action: Create Game Room */}
                  <div className="pt-2 border-t-2 border-zinc-200 space-y-3">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleCreateRoom}
                      className="w-full neo-btn bg-red-600 hover:bg-red-500 text-white font-black text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000]"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Create Game Room</span>
                    </button>

                    {/* Secondary option only if user has a manual code */}
                    <div className="pt-1 text-center">
                      {!showManualCodeInput ? (
                        <button
                          type="button"
                          onClick={() => setShowManualCodeInput(true)}
                          className="text-[11px] font-bold text-zinc-500 hover:text-zinc-800 underline"
                        >
                          Have a room code? Enter it here
                        </button>
                      ) : (
                        <form onSubmit={handleJoinRoom} className="pt-2 flex gap-2">
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="Enter Code (e.g. MEME42)"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3 py-2 rounded-xl border-2 border-zinc-900 text-xs font-mono font-bold uppercase bg-zinc-50"
                          />
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="neo-btn bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs px-3 rounded-xl flex items-center gap-1"
                          >
                            <span>Join</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ACTIVE ROOM IN LOBBY */}
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
        {/* VIEW 3: COUNTDOWN BUFFER (3-SECOND BUFFER / GREEN BLINK ON ACTOR PHONE) */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'countdown' && (
          <GreenTurnAlert
            isActor={isCurrentActor}
            actorName={currentActor?.name || 'Player'}
            countdownEndsAt={gameState.countdownEndsAt}
            onCountdownComplete={() => {
              // Actor signals start of 60s acting
              if (isCurrentActor) {
                handleAction('start_acting');
              }
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ACTIVE 60-SECOND ACTING CHARADES ROUND */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'acting' && (
          <>
            {isCurrentActor ? (
              <ActorView
                gameState={gameState}
                currentMeme={currentMeme}
                secondsRemaining={secondsRemaining}
                onRecordGuess={(winnerId) => handleAction('guess', { winnerId })}
                onTimeExpired={() => handleAction('timeout')}
              />
            ) : (
              <GuesserView gameState={gameState} secondsRemaining={secondsRemaining} />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: TIME'S UP / TIMEOUT ALERT (RED BLINKING) */}
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
        {/* VIEW 6: ROUND WON (CONFETTI & POINT REVEAL) */}
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
        {/* VIEW 7: GAME OVER / FINAL PODIUM */}
        {/* ========================================================================= */}
        {gameState && gameState.status === 'game_over' && (
          <LeaderboardPodium
            gameState={gameState}
            onRestart={() => handleAction('restart')}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          onClick={() => setShowHowToPlay(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border-4 border-zinc-900 shadow-[8px_8px_0px_#000] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 text-white p-3.5 border-b-3 border-zinc-900 flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider">
                How to Play
              </span>
              <button
                onClick={() => setShowHowToPlay(false)}
                aria-label="Close dialog"
                className="w-7 h-7 rounded-full bg-white text-zinc-950 border-2 border-zinc-900 flex items-center justify-center font-black"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="p-4 bg-amber-50 space-y-3 text-xs text-zinc-800 font-medium">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  <strong>Alphabetical Turn Order:</strong> The app orders players A &rarr; Z. Everyone takes turns acting!
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  <strong>Green Phone Alert:</strong> When your turn arrives, your phone blinks green for 3 seconds. Turn your screen away from friends!
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-black flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  <strong>1-Minute Charades:</strong> You have 60 seconds to act out the secret meme GIF! Other players shout guesses out loud.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <p>
                  <strong>Someone Guessed?</strong> Tap <strong>YES (Green)</strong> and pick their name! Their phone explodes with confetti and +1 point. If time expires, the screen blinks RED!
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-100 border-t-2 border-zinc-900">
              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full py-2 rounded-xl bg-zinc-900 text-white font-black text-xs"
              >
                Let&apos;s Play!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-zinc-900 border-t-3 border-zinc-950 py-3 text-center text-zinc-400 text-xs">
        <p className="font-bold">
          Dumb Charades: Meme Edition • Mobile Party Game
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf5ed] flex items-center justify-center p-6 text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DumbCharadesGame />
    </Suspense>
  );
}
