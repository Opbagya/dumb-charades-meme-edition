import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { GameState, MemeItem, Player } from '@/types/game';
import { CLASSIC_MEMES } from './memes';

export interface MultiplayerCallbacks {
  onStateUpdate: (state: GameState) => void;
  onWinnerFanfare?: (winnerId: string, winnerName: string) => void;
}

// Compute alphabetical turn order
export function computeAlphabeticalTurnOrder(players: Player[]): string[] {
  return [...players]
    .sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
    )
    .map((p) => p.id);
}

// Helper to shuffle array
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class RoomMultiplayer {
  private channel: RealtimeChannel | null = null;
  private roomCode: string;
  private currentPlayer: Player;
  private state: GameState;
  private callbacks: MultiplayerCallbacks;

  constructor(roomCode: string, currentPlayer: Player, callbacks: MultiplayerCallbacks) {
    this.roomCode = roomCode.toUpperCase().trim();
    this.currentPlayer = currentPlayer;
    this.callbacks = callbacks;

    // Initial state
    this.state = {
      roomId: this.roomCode,
      hostId: currentPlayer.id,
      status: 'lobby',
      deckMode: 'classic',
      players: [currentPlayer],
      turnOrder: [currentPlayer.id],
      currentTurnIndex: 0,
      currentRound: 1,
      totalRounds: 1,
      currentMemeIndex: 0,
      memes: shuffle(CLASSIC_MEMES),
      countdownEndsAt: null,
      roundEndsAt: null,
      roundDurationSeconds: 60,
      lastWinnerId: null,
      lastWinnerName: null,
      lastGuessedMeme: null,
      updatedAt: Date.now(),
    };
  }

  public connect() {
    const channelName = `dumbcharades-${this.roomCode}`;
    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    this.channel
      .on('broadcast', { event: 'sync_state' }, ({ payload }) => {
        if (!payload?.state) return;
        const incomingState = payload.state as GameState;

        // Accept newer or authoritative state
        if (incomingState.updatedAt >= (this.state.updatedAt || 0) - 1000) {
          this.state = incomingState;
          this.callbacks.onStateUpdate(this.state);
        }
      })
      .on('broadcast', { event: 'player_joined' }, ({ payload }) => {
        if (!payload?.player) return;
        const joiningPlayer = payload.player as Player;

        // If I am the host (or first player in room), add the player and broadcast latest state
        if (this.state.hostId === this.currentPlayer.id || this.state.players[0]?.id === this.currentPlayer.id) {
          const exists = this.state.players.some((p) => p.id === joiningPlayer.id);
          if (!exists) {
            this.state.players.push(joiningPlayer);
            this.state.turnOrder = computeAlphabeticalTurnOrder(this.state.players);
            this.state.updatedAt = Date.now();
            this.broadcastState();
          } else {
            // Already present, re-sync full state so newcomer has it
            this.broadcastState();
          }
        }
      })
      .on('broadcast', { event: 'request_sync' }, () => {
        // If I have players, broadcast my state
        if (this.state.players.length > 0) {
          this.broadcastState();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Announce arrival to room
          this.channel?.send({
            type: 'broadcast',
            event: 'player_joined',
            payload: { player: this.currentPlayer },
          });

          // Request state from existing peers
          this.channel?.send({
            type: 'broadcast',
            event: 'request_sync',
            payload: { from: this.currentPlayer.id },
          });
        }
      });

    return this;
  }

  public broadcastState() {
    this.callbacks.onStateUpdate(this.state);
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'sync_state',
      payload: { state: this.state },
    });
  }

  public startGame() {
    this.state.status = 'countdown';
    this.state.countdownEndsAt = Date.now() + 3500;
    this.state.currentTurnIndex = 0;
    this.state.currentRound = 1;
    this.state.currentMemeIndex = 0;
    this.state.memes = shuffle(CLASSIC_MEMES);
    this.state.turnOrder = computeAlphabeticalTurnOrder(this.state.players);
    this.state.players.forEach((p) => (p.score = 0));
    this.state.lastWinnerId = null;
    this.state.lastWinnerName = null;
    this.state.lastGuessedMeme = null;
    this.state.updatedAt = Date.now();

    this.broadcastState();
  }

  public startActing() {
    this.state.status = 'acting';
    this.state.countdownEndsAt = null;
    this.state.roundEndsAt = Date.now() + this.state.roundDurationSeconds * 1000;
    this.state.updatedAt = Date.now();

    this.broadcastState();
  }

  public recordGuess(winnerId: string) {
    const winner = this.state.players.find((p) => p.id === winnerId);
    if (winner) {
      winner.score += 1;
      this.state.lastWinnerId = winner.id;
      this.state.lastWinnerName = winner.name;
    }
    this.state.lastGuessedMeme = this.state.memes[this.state.currentMemeIndex] || null;
    this.state.status = 'round_won';
    this.state.updatedAt = Date.now();

    this.broadcastState();
  }

  public timeout() {
    this.state.status = 'timeout';
    this.state.lastWinnerId = null;
    this.state.lastWinnerName = null;
    this.state.updatedAt = Date.now();

    this.broadcastState();
  }

  public nextTurn() {
    const nextTurnIdx = this.state.currentTurnIndex + 1;
    if (nextTurnIdx < this.state.turnOrder.length) {
      this.state.currentTurnIndex = nextTurnIdx;
      this.state.currentMemeIndex = (this.state.currentMemeIndex + 1) % this.state.memes.length;
      this.state.status = 'countdown';
      this.state.countdownEndsAt = Date.now() + 3500;
      this.state.roundEndsAt = null;
    } else {
      if (this.state.currentRound < this.state.totalRounds) {
        this.state.currentRound += 1;
        this.state.currentTurnIndex = 0;
        this.state.currentMemeIndex = (this.state.currentMemeIndex + 1) % this.state.memes.length;
        this.state.status = 'countdown';
        this.state.countdownEndsAt = Date.now() + 3500;
        this.state.roundEndsAt = null;
      } else {
        this.state.status = 'game_over';
      }
    }
    this.state.updatedAt = Date.now();
    this.broadcastState();
  }

  public restartGame() {
    this.state.status = 'lobby';
    this.state.currentTurnIndex = 0;
    this.state.currentRound = 1;
    this.state.countdownEndsAt = null;
    this.state.roundEndsAt = null;
    this.state.lastWinnerId = null;
    this.state.lastWinnerName = null;
    this.state.lastGuessedMeme = null;
    this.state.players.forEach((p) => (p.score = 0));
    this.state.memes = shuffle(CLASSIC_MEMES);
    this.state.updatedAt = Date.now();

    this.broadcastState();
  }

  public destroy() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
