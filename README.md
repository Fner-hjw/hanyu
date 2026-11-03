# 汉语 Hànyǔ – Chinese for life & work

A complete, free Chinese learning platform (Next.js 16 · TypeScript · Tailwind v4 · FSRS spaced repetition).
Works offline-first in the browser; optional Supabase sync across devices; installable on your phone.

## What's inside
| Area | Features |
|---|---|
| **Today** | Daily goal ring, streak, due cards, level progress, shortcuts to mistakes and the path |
| **Path** | HSK 1–9 split into 20-word units: words, real sentences in context (recorded audio), quick quiz, unit flashcards |
| **Review** | FSRS flashcards over any deck (HSK levels, units, business topics, all due, mistakes, my words); recognise / recall / listen / type-pinyin / cloze modes; keyboard shortcuts |
| **Vocabulary** | 10,958 HSK 3.1 words + 363 hand-written business & finance words; tone-insensitive search; word sheet with examples, characters, CC-CEDICT senses, notes |
| **Listen** | 4,354 graded sentences with real recordings (normal/slow); meaning quiz; dictation in 汉字 or pinyin with per-character feedback |
| **Speak** | Speech-recognition scoring (homophone-tolerant), read-aloud, shadowing, English→Chinese; record & compare your voice |
| **Pronounce** | Tone contours, tone trainer (single & pairs), pinyin explorer, minimal pairs (zh/z, sh/s, n/l, an/ang…) |
| **Write** | Stroke order animation, tracing and writing from memory on a 米字格; 100 radicals |
| **Read** | 24 graded texts (HSK 2–6, 12 workplace/finance) with comprehension; paste-any-text reader with tap-a-word glosses and save-to-my-words |
| **Dialogues** | 21 dialogues (daily life + work) with play-all, role-play where you speak your lines, quiz |
| **Grammar** | 61 patterns HSK 1–6 with pitfalls, examples and drills |
| **Games** | Match pairs, sentence builder, 60-second speed round |
| **Tests** | Adaptive placement and generated HSK-style mock exams (listening, vocabulary, grammar, cloze, reading) |
| **Work toolkit** | 12 email templates, 127 phrases in 10 situations, numbers & money trainer (万/亿), 40 measure words, etiquette |
| **Mistakes / Progress** | Everything you got wrong in one place; heatmap, retention, skills, study plan for an exam date |

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Deploy (free)
Push to GitHub → import the repo on vercel.com → Deploy. For cross-device sync follow the steps on the app's **/account** page (Supabase, free tier).

## Data & licences
| Data | Source | Licence |
|---|---|---|
| HSK 3.1 word list | `hsk3.1-syllabus` | MIT |
| Meanings, dictionary | CC-CEDICT (MDBG) | CC BY-SA 4.0 |
| Graded sentences & audio | no7z/hsk-sentences-audio | CC BY-SA 4.0 |
| Character decomposition | Wikimedia Commons CCD | — |
| Stroke data (runtime) | hanzi-writer-data | Arphic PL |

Derived files in `public/data` and `public/dict` are shared under CC BY-SA 4.0. Regenerate with `scripts/build-data.mjs` / `scripts/build-dict.mjs`.

## Content & quality checks
```bash
npx tsx scripts/check-content.mts <ccd.json>   # structure, punctuation, pinyin vs CC-CEDICT, radicals
npx tsx scripts/check-vocab.mts                 # business-pack pinyin
for t in pinyin merge compare syllables shuffle numbers exam; do npx tsx scripts/test-$t.mts; done
```
Hand-written content (grammar, dialogues, readings, toolkit, business words) was drafted with AI assistance and reviewed; a native-speaker pass is still recommended.
