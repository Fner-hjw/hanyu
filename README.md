# 汉语 – Chinese for work

Local-first learning platform (Next.js 16, TypeScript, Tailwind, FSRS spaced repetition).

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploy (free)
1. Push to GitHub.
2. vercel.com → Add New Project → import the repo → Deploy (no config needed).

## Where things live
| What | Where |
|---|---|
| Vocabulary (363 words, 13 topics) | `src/data/vocab.ts` (core) and `src/data/vocab-pack.ts` (finance/business pack) – one row per word |
| Dialogues + comprehension quizzes | `src/data/dialogues.ts` |
| Grammar points + exercises | `src/data/grammar.ts` |
| Level-check questions (28) | `src/data/test.ts` |
| Spaced repetition + progress storage | `src/lib/store.ts` |
| Browser text-to-speech | `src/lib/audio.ts` |
| Dictionary lookup (CC-CEDICT, sharded) | `public/dict/`, `src/lib/dict.ts`, built by `scripts/build-dict.mjs` |
| Cloud sync (optional) | `src/components/SyncProvider.tsx`, `src/lib/merge.ts`, `supabase/schema.sql` |

## Cloud sync (optional, free)
Works without it (progress stays in the browser). To enable cross-device sync, follow the steps on the app's **/account** page: create a Supabase project, run `supabase/schema.sql`, set the redirect URL, and add `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel (see `.env.example`). Sign-in is by email link; progress is merged (newest review wins per card), never overwritten.

## Checks
```bash
npx tsx scripts/check-vocab.mts   # duplicates + pinyin cross-check against pinyin-pro and CC-CEDICT
npx tsx scripts/test-merge.mts    # sync merge logic
```

## Notes
- Dictionary data: CC-CEDICT © MDBG, CC BY-SA 4.0 (https://cc-cedict.org); the derived files in `public/dict/` are shared under the same license.
- Progress is stored in `localStorage`; use Export/Import on the home page to back up or move devices.
- HSK levels on words are approximate – check against the official HSK list.
- Audio uses the browser's Chinese voice (best on Chrome/Edge/Safari).
- All content was AI-drafted; have a native speaker review it.

## Next steps
Larger HSK-aligned vocabulary packs, pre-generated neural audio, a speaking/roleplay mode (AI tutor), more dialogues and grammar.
