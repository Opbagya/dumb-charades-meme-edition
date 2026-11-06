# Dumb Charades: Meme Edition 🤡

## Overview
**Dumb Charades: Meme Edition** is an in-person, mobile-first multiplayer party game where friends act out the internet's most iconic memes without speaking.

## Brand & Aesthetic Identity
- **Visual Style**: Groovy wavy red & cream retro checkerboard pattern (based on 70s-90s pop checkerboard aesthetics).
- **Colors**:
  - Crimson / Ruby Red: `#991b1b` / `#7f1d1d`
  - Vintage Cream / Warm Canvas: `#faf5ed` / `#fdfaf3`
  - Signal Green (Turn & Yes): `#15803d` / `#22c55e`
  - Alert Red (Timeout & No): `#b91c1c` / `#ef4444`
  - Jet Black / Ink: `#18181b`
  - Gold Accent: `#d97706`
- **Typography**: Neo-grotesque retro display (`Space Grotesk`) + crisp modern body (`DM Sans`) + digital stopwatch monospace tabular numerals.
- **Pure Visual Memes (No Text Spoilers)**: Meme names are omitted from cards and acting screens to preserve the fun and challenge of guessing!

## Navigation & Controls
- **Back & Leave Navigation**:
  - `← Exit` button in the top navigation banner from any screen.
  - Dedicated `← Back to Home` button in the Room Lobby and Game Over podium.
  - Confirmation dialog if exiting mid-game to prevent accidental leaves.
- **Clean Single-Mode Experience**: Direct 1-click room creation and joining with the built-in 76-meme party vault.

## Curated Meme Database (76 Local GIFs)
- 76 GIFs directly served locally from `/memes/*.gif` (copied from user asset database in `public/memes/`).
- Instant load times, zero external network dependencies, zero broken images.
- Ultra-smooth horizontal momentum scroll carousel on the home screen.

## Game Mechanics
1. **Real-World Multiplayer Sync**:
   - Host creates a room code (e.g. `MEME842`).
   - Shareable link (`/?room=MEME842`) allows friends to join instantly.
   - Real-time room synchronization via lightweight Next.js App Router API.
2. **Turn Order**:
   - Organized in **Alphabetical Order (A → Z)** so everyone gets an equal turn.
3. **Turn Transition & Green Light Pulse**:
   - The chosen actor's phone screen pulses with a **flashing neon green light** (`animate-turn-green`), haptic vibration (`navigator.vibrate`), and an energetic chime.
   - Screen warning: *"Turn phone away from your friends!"*
   - 3-second countdown buffer before the meme is revealed.
   - Other players see: *"Watch [Player Name], not your screen!"*
4. **Active 60-Second Charades Round**:
   - **For the Actor**: Large digital reverse countdown timer (60s → 0s), secret meme GIF playing muted on loop, acting instructions, and a prominent **"Someone Guessed?"** panel with **YES (Green)** and **NO (Red)** buttons.
   - Tapping **YES** reveals all other players' names; tapping a friend's name awards them +1 point and triggers **confetti** (`canvas-confetti`) on their phone!
   - **For Guessers**: Meme is strictly hidden. Guessers see the synchronized countdown clock and live score snapshot.
5. **60-Second Timeout**:
   - If 1 minute expires with no guess: screen blinks **RED** (`animate-timeout-red`) with buzzer sound, showing *"Miss? No one gets the point"*.
   - Includes an emergency override button *"Wait, Someone Guessed?"* in case of mishearing or buzzer-beaters.
6. **Game Over & Podium**:
   - 1st, 2nd, and 3rd place podium with crowns, medals, celebratory confetti showers, and quick return to main menu or rematch.
