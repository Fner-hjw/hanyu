# Handoff: continue building Hànyǔ

Read this first in a new session. It records where the project stands, how it's built, and how to keep working on it.

## Status (2026-11-03)
- Repo: https://github.com/Fner-hjw/hanyu, branch `main`, last commit `0deb0cc`.
- Phases 0–6 in `ROADMAP.md` are done. Phase 7 is next (see below).
- Phase 7a (done): account and navigation rework. Supabase is set up by the owner. Sign-in supports email + password (no email needed when "Confirm email" is off), GitHub/Google OAuth (buttons appear only when enabled; read from `/auth/v1/settings` via `getAuthSettings()`), email link, and password reset. Backup/restore moved from Today to `/account`. The sidebar has 4 groups (Study, Practice [collapsible], Tools, You) with the account chip at the top.
- Owner: an English speaker around HSK 4 who works in finance. Goals: speak more fluently and build workplace vocabulary. Prefers simplified characters and pinyin, free hosting (GitHub + Vercel + Supabase), and the best free audio.
- Working agreement from the owner: Opus owns architecture, core features and review. Lower-level tasks (content writing, pattern-following pages, QA sweeps) go to Sonnet or Haiku subagents, and Opus reviews everything before committing. Work in phases; each phase ends with a green build, lint, browser smoke test and a commit + push.

## Stack and conventions
- Next.js 16.4 (App Router, Turbopack, Cache Components on), React 19, TypeScript strict, Tailwind v4. **This Next.js has breaking changes**: read `node_modules/next/dist/docs/` before using unfamiliar APIs (see `AGENTS.md`).
- Gotchas already hit:
  - Never call `Date.now()` or `new Date()` during prerender or render. Gate time-dependent UI behind `useHydrated()`, or compute inside helpers or event handlers.
  - Dynamic routes are server `page.tsx` files with `generateStaticParams` + `await params`, rendering a client component. They must return at least one param.
  - Don't import values from `"use client"` modules into server components. Pure constants live in `src/lib/levels.ts`.
  - `useSearchParams` needs a `<Suspense>` boundary.
  - Lint rules are strict: no synchronous `setState` in effect bodies (defer with `setTimeout`), no impure calls in render.
  - `next typegen` regenerates route types after adding routes.
- Design system: tokens and component classes in `src/app/globals.css` (`card`, `btn`, `btn-primary`, `chip[data-active]`, `opt[data-state]`, `input`, `eyebrow`, `hanzi`/`han`). Primitives live in `src/components/ui.tsx`. The app shell (sidebar + mobile tabs) is in `src/components/Shell.tsx`. Navigation is in `src/lib/nav.ts` (groups `Study | Practice | Tools | You`), where items with `ready: false` stay hidden. `Hub` takes a list of groups.

## Architecture map
- **State:** `src/lib/store.ts` holds a single local-first store in localStorage (`hanyu:v1`) with cards, log, known, notes, mistakes, bank, writing, grammarDone, dialoguesDone, readingsDone, tests and settings. It syncs across tabs. `src/lib/merge.ts` is a commutative merge used by Supabase sync (`src/components/SyncProvider.tsx`, schema in `supabase/schema.sql`). A new state field must be added to `DEFAULT_STATE`, `normalize()`, `mergeStates()`, `fingerprint()` and `scripts/test-merge.mts`.
- **Data:**
  - `public/data/words-{1..7}.json` (7 = HSK 7–9), `sentences-{1..6}.json` and `chars.json` are built by `scripts/build-data.mjs`.
  - `public/dict/*.json` (CC-CEDICT shards) is built by `scripts/build-dict.mjs`.
  - `src/lib/data.ts` provides the loaders, the unified `Word` type, decks and `useAsync`. Word IDs look like `h<seq>`; the level is derived via `levelOfId`.
  - Business words use IDs `w###`, and word-bank IDs are `bank:<zh>`.
- **Hand-written content** lives in `src/data/`: `vocab.ts` + `vocab-pack.ts`, `grammar.ts` + `grammar-more.ts` → `grammar-all.ts`, `dialogues.ts` + `dialogues-more.ts` → `dialogues-all.ts`, `readings.ts`, `toolkit.ts` and `radicals.ts`. Schemas are in `src/data/types.ts`.
- **Engines:**

  | File | What it does |
  |---|---|
  | `lib/pinyin.ts` | Typed-pinyin checking |
  | `lib/compare.ts` | Speech/dictation scoring, homophone-tolerant |
  | `lib/speech.ts` | Recognizer and recorder hooks |
  | `lib/syllables.ts` | Tones and minimal pairs |
  | `lib/quiz.ts` | Seeded RNG and multiple-choice generation |
  | `lib/shuffle.ts` | Option shuffling |
  | `lib/exam.ts` | Mock exams and the placement staircase |
  | `lib/numbers.ts` | 万/亿 readings |
  | `lib/mistakes.ts` | Resolves mistake keys |
  | `lib/resolve.ts` | Deck planning |
  | `lib/audio.ts` | Text-to-speech plus recorded clips with fallback |
  | `lib/dict.ts` | Lazy dictionary lookups |
- **Mistake key formats:**
  - Words: a word ID.
  - Sentences: `listen:<sid>`, `build:<sid>`, `speak:s:<sid>`, `speak:p:<group>:<i>`, `speak:d:<dialogue>:<i>`.
  - Questions: `grammar:<id>:<i>`, `read:<id>:<i>`, `dlg:<id>:<i>`.
  - Characters: `char:<c>`.
- **Pages:**

  | Route | Page |
  |---|---|
  | `/` | Today |
  | `/learn`, `/learn/[level]/[unit]` | Learning path |
  | `/flashcards` | Flashcards (`?deck=` accepts `hsk-N`, `unit-L-N`, `biz-*`, `due`, `mistakes`, `bank`) |
  | `/vocab` | Vocabulary |
  | `/listen`, `/speak`, `/pronounce`, `/write` | Skill practice |
  | `/reader`, `/dialogues`, `/grammar`, `/games` | Reading, dialogues, grammar, games |
  | `/test` | Tests |
  | `/toolkit` | Work toolkit (includes `NumbersTrainer.tsx`) |
  | `/mistakes`, `/stats`, `/account` | Mistakes, progress, account |
  | `/practice`, `/more` | Hubs |

## Verifying changes
```bash
npx tsc --noEmit && npm run lint
for t in pinyin merge compare syllables shuffle numbers exam; do npx tsx scripts/test-$t.mts; done
npx tsx scripts/check-content.mts <path to chinese-characters-decomposition ccd.json>
npm run build && npm run start -- -p 3117   # then drive it with Playwright (pre-installed)
```
Browser-test tips from this project:
- Mock `window.SpeechRecognition` (not only the `webkit` one), because Chromium exposes the unprefixed version.
- Abort `raw.githubusercontent.com` requests to exercise the audio fallback.
- Serve `hanzi-writer-data` locally by routing `cdn.jsdelivr.net` and `unpkg.com`.
- Check overflow at 390px and 1280px.
- Rebuilding the data needs the npm tarballs (`hsk3.1-syllabus`, `hsk-sentences-audio`, `chinese-characters-decomposition`, `cedict-json`) fetched with `npm pack` into a scratch directory. The npm registry is reachable from cloud sessions; mdbg and jsdelivr are not.

## Known limitations
- Speech scoring was only tested with a simulated recognizer. Real scoring needs Chrome, Edge or Safari.
- Recorded audio comes from GitHub raw and stroke data from jsDelivr, with unpkg as the fallback. There is no offline support yet.
- Content written with AI help was reviewed by Opus but not by a native speaker.
- Without an SMTP server, Supabase's built-in mailer only reaches project team members and is rate-limited, so email links and password resets are for the owner only. Password sign-up works for anyone if "Confirm email" is off.
- The empty clone at `/home/user/hanyu-github` in the old container can be ignored.

## Phase 7 (next): suggested order
1. Offline mode: a service worker that caches the app shell, `public/data`, dictionary shards and recently used audio/stroke data.
2. AI conversation partner: role-play workplace scenarios with corrections. It needs an API key, and the owner should decide on cost first.
3. More content (via subagents + review): more readings and dialogues at HSK 5–6 for finance, plus extra example sentences for words without any.
4. A spoken (HSKK-style) test using `lib/compare` and `lib/speech`.
5. Writing practice: sentence composition with feedback.
6. A native-speaker review checklist exported from `src/data`.
