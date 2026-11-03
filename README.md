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
| Vocabulary (114 words, 7 topics) | `src/data/vocab.ts` – one row per word |
| Dialogues + comprehension quizzes | `src/data/dialogues.ts` |
| Grammar points + exercises | `src/data/grammar.ts` |
| Level-check questions (28) | `src/data/test.ts` |
| Spaced repetition + progress storage | `src/lib/store.ts` |
| Browser text-to-speech | `src/lib/audio.ts` |

## Notes
- Progress is stored in `localStorage`; use Export/Import on the home page to back up or move devices.
- HSK levels on words are approximate – check against the official HSK list.
- Audio uses the browser's Chinese voice (best on Chrome/Edge/Safari).
- All content was AI-drafted; have a native speaker review it.

## Next steps
Supabase accounts + sync, CC-CEDICT lookup in the Reader, bigger vocabulary packs, pre-generated neural audio, AI roleplay tutor.
