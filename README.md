# me llafe - Wordle Albanian

An Albanian-first Wordle experience with bilingual support (Shqip/English), three play modes, and a mobile-friendly keyboard UI.

## What this game does

- **Classic Wordle rules:** guess a 5-letter word in up to 6 attempts.
- **Letter feedback per guess:**
  - `correct` (green): correct letter in correct position
  - `partial` (yellow): letter exists in word but wrong position
  - `incorrect` (gray): letter not present in the target word
- **Dictionary-based validation:** full words are validated against loaded dictionaries before submission.
- **Bilingual gameplay:** language can switch between Albanian and English, including translations and keyboard/alphabet rules.
- **Persistent progress (mode-dependent):**
  - Daily and Friends games persist state in `localStorage`.
  - Free Game is intentionally non-persistent.

## Game modes

### 1) Daily (`/daily`)

- Deterministic daily word generated from date + language.
- Same word for everyone using the same language on the same date.
- Marks the puzzle as completed once won/lost and blocks re-playing that day's puzzle.
- Includes share output with emoji grid (`🟩🟨⬛`) and date.
- Supports calendar date selection for viewing/playing date-based words.

### 2) Free Game (`/game`)

- Unlimited random games from currently loaded 5-letter dictionary terms.
- Includes fallback words while dictionary data is still loading.
- New random target generated on reset/new game.

### 3) Friends Challenge (`/friends` and `/friends/:gameId`)

- Creator enters a valid 5-letter word + name.
- Generates an encrypted challenge payload link (AES-GCM token format) so the word is not trivially exposed as plain text/base64.
- Shared link opens challenge page for other players.
- Supports retry and share result grid after completion.
- Includes fallback support for legacy localStorage game entries.

## Frontend functionality (implemented behavior)

- **Input handling**
  - Physical keyboard support (`keydown` + `keypress`).
  - On-screen keyboard overlay for desktop/mobile.
  - Handles `Enter`, `Backspace/Delete`, and alphabet-restricted character input.
  - Prevents interference with browser shortcuts and focused input fields.

- **Validation and dictionary loading**
  - Dictionary loading is started asynchronously and non-blocking.
  - 5-letter term extraction supports multiple dictionary JSON shapes.
  - Guess submission is blocked when a word is not in dictionary (unless it exactly matches target).
  - Albanian variation support (e.g., handling `E/Ë` and `C/Ç` variations in validation).

- **State and persistence**
  - Core game state: board, row/column cursor, status, guesses, and keyboard letter states.
  - Sensitive target word is not stored in persisted state objects.
  - Daily and friends sessions are restored from `localStorage` by game-specific keys.

- **UX details**
  - Tile reveal animation and short post-reveal highlight animation.
  - Toast notifications for invalid words, wins, losses, and copy/share actions.
  - Responsive card-based home layout and modal/popover UI elements.

## Routes

- `/` - Home page (mode selection + rules overview)
- `/game` - Free play mode
- `/daily` - Daily puzzle mode
- `/friends` - Create a friends challenge
- `/friends/:gameId` - Play a shared challenge

## Tech stack (frontend)

- React 18 + TypeScript
- Vite 5 (`@vitejs/plugin-react-swc`)
- React Router
- Tailwind CSS + shadcn/ui (Radix-based components)
- TanStack Query provider (configured in app shell)
- Web Crypto API (`crypto.subtle`) for challenge payload encryption

## Run locally

```bash
npm install
npm run dev
```

Default Vite dev server is configured for port `8080`.

## Build

```bash
npm run build
npm run preview
```
