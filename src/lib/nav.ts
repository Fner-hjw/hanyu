import {
  CalendarCheck, Route, Layers, BookText, Headphones, Mic, AudioLines, PenLine, BookOpen,
  MessagesSquare, Puzzle, ClipboardCheck, Briefcase, NotebookPen, ChartNoAxesColumn, Languages, Gamepad2,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; desc: string; icon: LucideIcon; group: "Learn" | "Practice" | "Tools"; ready: boolean };

/** `ready: false` items are hidden until the feature ships (see ROADMAP.md) */
export const NAV: NavItem[] = [
  { href: "/", label: "Today", desc: "Your plan, streak and goals", icon: CalendarCheck, group: "Learn", ready: true },
  { href: "/learn", label: "Path", desc: "HSK 1–9 lessons, unit by unit", icon: Route, group: "Learn", ready: true },
  { href: "/flashcards", label: "Review", desc: "Spaced-repetition flashcards", icon: Layers, group: "Learn", ready: true },
  { href: "/vocab", label: "Vocabulary", desc: "Browse and search every word", icon: BookText, group: "Learn", ready: true },
  { href: "/listen", label: "Listen", desc: "Real audio, dictation, comprehension", icon: Headphones, group: "Practice", ready: true },
  { href: "/speak", label: "Speak", desc: "Shadowing and pronunciation scoring", icon: Mic, group: "Practice", ready: true },
  { href: "/pronounce", label: "Pronounce", desc: "Pinyin chart and tone drills", icon: AudioLines, group: "Practice", ready: true },
  { href: "/write", label: "Write", desc: "Stroke order and handwriting", icon: PenLine, group: "Practice", ready: true },
  { href: "/reader", label: "Read", desc: "Graded texts and tap-a-word reader", icon: BookOpen, group: "Practice", ready: true },
  { href: "/dialogues", label: "Dialogues", desc: "Everyday and workplace conversations", icon: MessagesSquare, group: "Practice", ready: true },
  { href: "/grammar", label: "Grammar", desc: "Patterns with examples and drills", icon: Puzzle, group: "Practice", ready: true },
  { href: "/games", label: "Games", desc: "Matching, sentence building, speed rounds", icon: Gamepad2, group: "Practice", ready: true },
  { href: "/test", label: "Tests", desc: "Level check and mock exams", icon: ClipboardCheck, group: "Tools", ready: true },
  { href: "/toolkit", label: "Work toolkit", desc: "Emails, phrases, measure words, etiquette", icon: Briefcase, group: "Tools", ready: true },
  { href: "/mistakes", label: "Mistakes", desc: "Review what you got wrong", icon: NotebookPen, group: "Tools", ready: true },
  { href: "/stats", label: "Progress", desc: "Stats and study plan", icon: ChartNoAxesColumn, group: "Tools", ready: true },
];
export const LOGO = Languages;
export const visibleNav = () => NAV.filter((n) => n.ready);
