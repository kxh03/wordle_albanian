# 6 llafe - Wordle Albanian

An Albanian-first Wordle experience with bilingual support (Shqip / English), three play modes, optional accounts for daily progress, and a mobile-friendly keyboard UI.

## Repository layout

This project is a **monorepo**:

| Path | Role |
|------|------|
| Repository root | **Frontend** — React (Vite) SPA, `src/`, `package.json` |
| `backend/` | **Backend** — Laravel 13 API, PHP 8.3+, `composer.json` |

In local development, the Vite dev server proxies `/api` to the Laravel app so the browser can call the API on the same origin.

## What this game does

- **Classic Wordle rules:** guess a 5-letter word in up to 6 attempts.
- **Letter feedback per guess:**
  - `correct` (green): correct letter in correct position
  - `partial` (yellow): letter exists in word but wrong position
  - `incorrect` (gray): letter not present in the target word
- **Dictionary-based validation:** guesses are checked against **5-letter word lists** stored in the Laravel database (loaded from JSON dictionaries). Albanian matching normalizes **Ë → E** and **Ç → C** for comparisons, consistent on the API and in the client.
- **Bilingual gameplay:** UI language (Albanian / English), translations, and keyboard layouts; game language is sent to the API as `sq` or `en` (headers / query where applicable).
- **Persistent progress (mode-dependent):**
  - **Daily** (logged-in): progress and stats are stored on the server; the UI may still mirror state locally.
  - **Daily / Friends** (guest or supplemental): some state can live in `localStorage`.
  - **Free Game** is intentionally lightweight and driven by API tokens for the hidden word.

## Game modes

### 1) Daily (`/daily`)

- Daily puzzle per language and date, backed by the API when authenticated.
- Share output with emoji grid (`🟩🟨⬛`) and date.
- Calendar / history where implemented.

### 2) Free Game (`/game`)

- Random targets from the server (`POST /api/games/free`).
- New game / reset fetches a new challenge.

### 3) Friends Challenge (`/friends` and `/friends/:gameId`)

- Creator enters a valid 5-letter word and name; challenge links use an encrypted payload so the word is not plain in the URL.
- Shared link opens the challenge for other players.

### 4) Auth (`/login`, `/register`)

- Laravel **Sanctum** token-based API auth for registered users (daily features, profile, etc.).

## Frontend

### Tech stack

- **React 18** + **TypeScript**
- **Vite 5** (`@vitejs/plugin-react-swc`)
- **React Router** v6
- **Tailwind CSS** + **shadcn/ui** (Radix)
- **TanStack Query** for server state
- **Axios** / `fetch` for HTTP (`src/lib/api.ts`)
- **Web Crypto API** (`crypto.subtle`) for friends challenge encryption where used

### Source layout (high level)

- `src/pages/` — route-level screens (home, game, daily, friends, auth).
- `src/components/` — game UI, daily flow, friends, layout, shared UI.
- `src/contexts/LanguageContext.tsx` — UI language, keyboard config, copy.
- `src/hooks/` — game logic (`useWordleGame`, auth, etc.).
- `src/lib/api.ts` — API base URL, language codes, typed fetch helpers.

### API base URL

- **Default (local):** requests use `/api`. Vite proxies `/api` → `http://localhost:8000` (see `vite.config.ts`).
- **Override:** set `VITE_API_URL` to a full origin (no trailing slash), e.g. `https://api.example.com`, for production or a remote backend.

### Run the frontend

From the **repository root**:

```bash
npm install
npm run dev
```

- Dev server: **port `8080`**, host `::` (see `vite.config.ts`).
- Ensure the Laravel API is running on **`http://localhost:8000`** (or adjust the proxy target in `vite.config.ts`).

### Build / preview

```bash
npm run build
npm run preview
```

Serve the built `dist/` behind any static host; configure `VITE_API_URL` at build time if the API is on another domain (and enable CORS / Sanctum stateful domains on the backend as needed).

## Backend

### Tech stack

- **Laravel 13**, **PHP ^8.3**
- **Laravel Sanctum** for API tokens
- **Database:** SQLite by default in `.env.example`; PostgreSQL / MySQL supported via Laravel config
- **Migrations** under `backend/database/migrations/`

### Important paths

| Path | Purpose |
|------|---------|
| `backend/routes/api.php` | JSON API under `/api/...` |
| `backend/app/Http/Controllers/Api/` | Auth, games, daily, dictionary, friends, stats |
| `backend/app/Services/` | Game engine, word normalization, daily logic, import, caching |
| `backend/resources/dictionaries/en.json` | Shipped **English** 5-letter dictionary (versioned) |
| `backend/resources/dictionaries/sq.json` | Shipped **Albanian** 5-letter dictionary (versioned) |
| `scripts/build_dictionaries.py` | Regenerates `en.json` / `sq.json` from project assets (optional network for extra English words) |

### API surface (summary)

Public / language-aware examples:

- `GET /api/dictionary/meta` — word counts per language
- `GET /api/dictionary/random?lang=sq|en`
- `POST /api/dictionary/validate` — body: guess + language; checks dictionary
- `POST /api/games/free`, `POST /api/games/daily`, `POST /api/games/submit` — free/daily setup and guess evaluation (with `X-Language` / `EnsureLanguageHeader` where required)

Authenticated (`Authorization: Bearer <token>`):

- `POST /api/auth/register`, `POST /api/auth/login`
- `POST /api/auth/logout`, `GET /api/auth/me`, `PATCH /api/auth/profile`
- Daily routes: `GET/POST /api/daily`, `POST /api/daily/guess`, history/calendar as defined in `routes/api.php`
- Friends / stats as registered in `routes/api.php`

### Word import and database

Words are imported into the `words` table from **`backend/resources/dictionaries/{en,sq}.json`** (primary source). Imports are **chunked** for large lists (PostgreSQL parameter limits).

After migrations (and whenever dictionaries change), run:

```bash
cd backend
php artisan dictionary:import
```

`php artisan db:seed` runs `WordSeeder`, which calls the same import service.

To **rebuild** dictionary JSON from the repo (English: Wordle-style list + optional dwyl word list; Albanian: headwords from root `dictionary.json`):

```bash
python scripts/build_dictionaries.py
```

Then commit updated `backend/resources/dictionaries/*.json` if desired and run `dictionary:import` again.

### Backend setup (local)

From `backend/`:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configure the database in `.env` (`DB_*`). For SQLite (default in example), ensure the database file path exists if required by your Laravel version, then:

```bash
php artisan migrate
php artisan dictionary:import
```

Run the API (default Laravel port used by the Vite proxy is **8000**):

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

### Environment notes

- **`APP_URL`:** should match how clients reach the API (affects URL generation in some setups).
- **Sanctum SPA / cookies:** if you use cookie-based flows from a separate origin, set `SANCTUM_STATEFUL_DOMAINS` to include your frontend host and port (e.g. `localhost:8080`). Token `Authorization` headers work across origins when CORS allows them.
- **CORS:** configure in Laravel if the frontend is not same-origin (production split domains).

### Tests

```bash
cd backend
php artisan test
```

## Routes (frontend)

| Path | Description |
|------|-------------|
| `/` | Home (mode selection, rules) |
| `/game` | Free play |
| `/daily` | Daily puzzle |
| `/friends` | Create friends challenge |
| `/friends/:gameId` | Play challenge |
| `/login`, `/register` | Auth |

## Implemented UX / behavior (frontend)

- Physical keyboard and on-screen keyboard; `Enter` / `Backspace`; language-appropriate alphabet.
- Guess validation against the **API dictionary** before accepting a row (where the game mode wires `validateGuess`).
- Tile animations, toasts, responsive layout.

---

For questions about regenerating word lists or deploying API + SPA separately, see the **Word import** and **API base URL** sections above.
