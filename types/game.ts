export type DeckMode = 'classic' | 'custom';

export type GameStatus =
  | 'lobby'        // Players entering room, picking avatars
  | 'countdown'    // 3-second buffer before turn starts (green blink for actor)
  | 'acting'       // 60-second active charades round
  | 'round_won'    // Actor marked someone guessed correctly
  | 'timeout'      // 60 seconds ran out without a guess (red blink)
  | 'game_over';   // All turns / rounds finished, final podium

export interface MemeItem {
  id: string;
  title: string;
  clue: string;
  category?: string;
  gifUrl: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  joinedAt: number;
  isHost: boolean;
}

export interface GameState {
  roomId: string;
  hostId: string;
  status: GameStatus;
  deckMode: DeckMode;
  players: Player[];
  turnOrder: string[]; // List of player IDs sorted alphabetically by name
  currentTurnIndex: number;
  currentRound: number;
  totalRounds: number;
  currentMemeIndex: number;
  memes: MemeItem[];
  countdownEndsAt: number | null;
  roundEndsAt: number | null;
  roundDurationSeconds: number; // default 60
  lastWinnerId: string | null;
  lastWinnerName: string | null;
  lastGuessedMeme: MemeItem | null;
  updatedAt: number;
}

export interface RoomActionPayload {
  action:
    | 'join'
    | 'start'
    | 'start_acting'
    | 'guess'
    | 'timeout'
    | 'next_turn'
    | 'restart'
    | 'update_settings'
    | 'add_custom_meme';
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
  deckMode?: DeckMode;
  totalRounds?: number;
  winnerId?: string;
  customMeme?: MemeItem;
  customMemes?: MemeItem[];
}
