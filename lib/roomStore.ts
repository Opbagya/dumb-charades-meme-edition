import { GameState, MemeItem, Player, RoomActionPayload } from '../types/game';
import { CLASSIC_MEMES } from './memes';

declare global {
  // eslint-disable-next-line no-var
  var __MEME_ROOMS__: Map<string, GameState> | undefined;
}

if (!globalThis.__MEME_ROOMS__) {
  globalThis.__MEME_ROOMS__ = new Map<string, GameState>();
}

const rooms = globalThis.__MEME_ROOMS__;

// Helper to shuffle array
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Compute alphabetical turn order
export function computeAlphabeticalTurnOrder(players: Player[]): string[] {
  return [...players]
    .sort((a, b) =>
      a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: 'base' })
    )
    .map((p) => p.id);
}

export function getOrCreateRoom(roomId: string, initialHost?: { id: string; name: string; avatar: string }): GameState {
  const cleanId = roomId.toUpperCase().trim();
  let room = rooms.get(cleanId);

  if (!room) {
    const host: Player = {
      id: initialHost?.id || `p_${Math.random().toString(36).substring(2, 9)}`,
      name: initialHost?.name || 'Player 1',
      avatar: initialHost?.avatar || '😎',
      score: 0,
      joinedAt: Date.now(),
      isHost: true,
    };

    room = {
      roomId: cleanId,
      hostId: host.id,
      status: 'lobby',
      deckMode: 'classic',
      players: [host],
      turnOrder: [host.id],
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
    rooms.set(cleanId, room);
  }

  return room;
}

export function handleRoomAction(roomId: string, payload: RoomActionPayload): GameState {
  const cleanId = roomId.toUpperCase().trim();
  const room = getOrCreateRoom(cleanId);

  switch (payload.action) {
    case 'join': {
      if (!payload.playerName || !payload.playerId) break;
      const existingIdx = room.players.findIndex((p) => p.id === payload.playerId);
      if (existingIdx >= 0) {
        room.players[existingIdx].name = payload.playerName;
        if (payload.playerAvatar) room.players[existingIdx].avatar = payload.playerAvatar;
      } else {
        const newPlayer: Player = {
          id: payload.playerId,
          name: payload.playerName,
          avatar: payload.playerAvatar || '🤪',
          score: 0,
          joinedAt: Date.now(),
          isHost: room.players.length === 0,
        };
        room.players.push(newPlayer);
      }
      room.turnOrder = computeAlphabeticalTurnOrder(room.players);
      break;
    }

    case 'update_settings': {
      if (payload.deckMode) room.deckMode = payload.deckMode;
      if (payload.totalRounds) room.totalRounds = payload.totalRounds;
      if (payload.customMemes && payload.customMemes.length > 0) {
        room.memes = shuffle(payload.customMemes);
      }
      break;
    }

    case 'add_custom_meme': {
      if (payload.customMeme) {
        room.memes.unshift(payload.customMeme);
      }
      break;
    }

    case 'start': {
      // Sort players in alphabetical order
      room.turnOrder = computeAlphabeticalTurnOrder(room.players);
      room.currentTurnIndex = 0;
      room.currentRound = 1;
      room.currentMemeIndex = 0;
      if (payload.customMemes && payload.customMemes.length > 0) {
        room.memes = shuffle(payload.customMemes);
      } else if (room.deckMode === 'classic') {
        room.memes = shuffle(CLASSIC_MEMES);
      }

      // Reset scores
      room.players.forEach((p) => (p.score = 0));
      room.lastWinnerId = null;
      room.lastWinnerName = null;
      room.lastGuessedMeme = null;

      // Start 3-second buffer countdown
      room.status = 'countdown';
      room.countdownEndsAt = Date.now() + 3500;
      break;
    }

    case 'start_acting': {
      room.status = 'acting';
      room.countdownEndsAt = null;
      room.roundEndsAt = Date.now() + room.roundDurationSeconds * 1000;
      break;
    }

    case 'guess': {
      if (payload.winnerId) {
        const winner = room.players.find((p) => p.id === payload.winnerId);
        if (winner) {
          winner.score += 1;
          room.lastWinnerId = winner.id;
          room.lastWinnerName = winner.name;
        }
      }
      room.lastGuessedMeme = room.memes[room.currentMemeIndex] || null;
      room.status = 'round_won';
      break;
    }

    case 'timeout': {
      room.status = 'timeout';
      room.lastWinnerId = null;
      room.lastWinnerName = null;
      break;
    }

    case 'next_turn': {
      const nextTurnIdx = room.currentTurnIndex + 1;
      if (nextTurnIdx < room.turnOrder.length) {
        // Next player in this round
        room.currentTurnIndex = nextTurnIdx;
        room.currentMemeIndex = (room.currentMemeIndex + 1) % room.memes.length;
        room.status = 'countdown';
        room.countdownEndsAt = Date.now() + 3500;
        room.roundEndsAt = null;
      } else {
        // Round complete! Check if more rounds remain
        if (room.currentRound < room.totalRounds) {
          room.currentRound += 1;
          room.currentTurnIndex = 0;
          room.currentMemeIndex = (room.currentMemeIndex + 1) % room.memes.length;
          room.status = 'countdown';
          room.countdownEndsAt = Date.now() + 3500;
          room.roundEndsAt = null;
        } else {
          // Game finished!
          room.status = 'game_over';
        }
      }
      break;
    }

    case 'restart': {
      room.status = 'lobby';
      room.currentTurnIndex = 0;
      room.currentRound = 1;
      room.countdownEndsAt = null;
      room.roundEndsAt = null;
      room.lastWinnerId = null;
      room.lastWinnerName = null;
      room.lastGuessedMeme = null;
      room.players.forEach((p) => (p.score = 0));
      room.memes = shuffle(room.deckMode === 'classic' ? CLASSIC_MEMES : room.memes);
      break;
    }
  }

  room.updatedAt = Date.now();
  rooms.set(cleanId, room);
  return room;
}
