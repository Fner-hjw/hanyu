import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline – Hanyu Easy" };

/** Served by the service worker for pages that weren't saved before going offline. */
export default function Offline() {
  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><WifiOff size={26} /></span>
      <h1 className="text-2xl font-bold tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 text-muted">
        This page wasn&apos;t saved on this device yet. Pages you&apos;ve opened before still work, and your progress is saved here and will sync when you&apos;re back online.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">Today</Link>
        <Link href="/flashcards" className="btn">Review</Link>
        <Link href="/vocab" className="btn">Vocabulary</Link>
      </div>
      <p className="mt-6 text-xs text-muted">
        Tip: under <Link href="/account" className="font-semibold text-accent">Account → Offline</Link> you can download every page ahead of time.
      </p>
    </div>
  );
}
