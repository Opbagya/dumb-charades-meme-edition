# Dumb Charades: Meme Edition 🤡

## Live Deployment & Repository
* **Live Vercel Site:** [https://dumb-charades-meme-edition.vercel.app](https://dumb-charades-meme-edition.vercel.app)
* **GitHub Repository:** [https://github.com/Opbagya/dumb-charades-meme-edition](https://github.com/Opbagya/dumb-charades-meme-edition)
* **Active Branches:** `dubdub-Dumb-Charades-meme-edition` and `main` (synchronized)

## Multiplayer Architecture (Same as Roadsterdash)
* **Technology:** Supabase Realtime Broadcast & Presence channels (`@supabase/supabase-js`).
* **Real-time Sync:** Bidirectional WebSocket communication with sub-50ms latency across any device anywhere in the world on any network (mobile data 4G/5G, Wi-Fi, etc.).
* **Zero Server Ephemeral Bottlenecks:** No reliance on isolated edge memory instances—multiplayer coordinates seamlessly across global Cloudflare edge points.
* **Synchronized Events:**
  - Room joining & presence announcement
  - Alphabetical turn ordering ($A \to Z$)
  - 3-second green light blinking turn trigger
  - 60-second synchronized reverse digital countdown stopwatch
  - Actor "YES / NO" guesser point award
  - Real-time winner confetti burst on the guesser's phone
  - Timeout red blinking alert & buzzer

## Brand & Aesthetic Identity
* **Visual Style:** Groovy wavy red & cream retro checkerboard pattern (`public/checker-pattern.jpg`).
* **Colors:** Deep Crimson (`#991b1b`), Vintage Warm Cream (`#faf5ed`), Pop Signal Green (`#15803d`), Alert Red (`#b91c1c`), Jet Black (`#18181b`).
* **Meme Database:** 76 local GIFs bundled directly in `public/memes/*.gif` for instant zero-latency loading.
* **No Meme Names:** Meme names are omitted on cards and acting screens to keep Dumb Charades guessing completely unspoiled.
