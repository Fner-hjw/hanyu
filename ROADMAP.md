# Roadmap – goal: a complete Chinese learning platform

Goal: one place to learn and practise everything – vocabulary (HSK 1–9 + business), characters and
writing, pronunciation, listening, speaking, reading, grammar, dialogues, tests – with spaced repetition,
a guided path and progress tracking.

| Phase | Scope | Status |
|---|---|---|
| 0 | MVP: flashcards, 6 dialogues, 12 grammar points, reader, level test, optional Supabase sync | done |
| 1 | Foundation: design system + app shell; data pipeline (11k HSK words, 4,354 sentences with audio, characters) | done |
| 2 | Learn path (levels → units), vocabulary browser, flashcards v2 | done |
| 3 | Listening, speaking (speech recognition), pronunciation; toolkit and reading library | done |
| 4 | Handwriting trainer + radicals, 61 grammar points, 21 dialogues with role-play | done |
| 5 | Adaptive placement + generated mock exams, numbers & money trainer, progress & study plan | done |
| 6 | Mistakes notebook, personal word bank, games, installable app (PWA) | done |
| 7 (in progress) | Account rework + email/password/OAuth sign-in (done); offline mode (done); AI connection with your own key + conversation partner (/talk) + sentence composition (/compose) (done); more finance readings/dialogues + HSK 4–5 example sentences (done); HSKK speaking test (done); independent content audit | in progress |

Each phase ends with a green build, lint, browser smoke test and a commit.

## Data sources (all open)
- HSK 3.1 syllabus word list – `hsk3.1-syllabus` (MIT)
- English meanings and dictionary – CC-CEDICT, CC BY-SA 4.0
- Graded sentences with audio – `no7z/hsk-sentences-audio`, CC BY-SA 4.0 (audio generated with CosyVoice2, Apache-2.0)
- Character decomposition – Wikimedia Commons CCD table via `chinese-characters-decomposition` (MIT)
- Stroke-order data – `hanzi-writer-data` (Arphic Public License), loaded at runtime
