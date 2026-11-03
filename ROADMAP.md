# Roadmap – goal: a complete Chinese learning platform

Goal: one place to learn and practise everything – vocabulary (HSK 1–9 + business), characters and
writing, pronunciation, listening, speaking, reading, grammar, dialogues, tests – with spaced repetition,
a guided path and progress tracking.

| Phase | Scope | Status |
|---|---|---|
| 0 | MVP: flashcards, 6 dialogues, 12 grammar points, reader, level test, optional Supabase sync | done |
| 1 | Foundation: new design system + app shell; data pipeline for HSK 3.1 words (11,000), 4,354 graded sentences with audio, characters | in progress |
| 2 | Learn path (levels → units), vocabulary browser, flashcards v2 (decks, typing/listening/cloze modes) | |
| 3 | Listening (real audio, dictation), speaking (speech recognition, shadowing), pronunciation (pinyin chart, tone drills) | |
| 4 | Characters & writing (stroke order, handwriting quiz, radicals), graded reading, ~50 grammar points | |
| 5 | 20+ dialogues, business toolkit (emails, numbers/money, measure words), generated mock exams, stats, final QA | |

Each phase ends with a green build, lint, browser smoke test and a commit.

## Data sources (all open)
- HSK 3.1 syllabus word list – `hsk3.1-syllabus` (MIT)
- English meanings and dictionary – CC-CEDICT, CC BY-SA 4.0
- Graded sentences with audio – `no7z/hsk-sentences-audio`, CC BY-SA 4.0 (audio generated with CosyVoice2, Apache-2.0)
- Character decomposition – Wikimedia Commons CCD table via `chinese-characters-decomposition` (MIT)
- Stroke-order data – `hanzi-writer-data` (Arphic Public License), loaded at runtime
