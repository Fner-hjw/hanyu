import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { SyncProvider } from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "汉语 – Chinese for work",
  description: "Flashcards, dialogues, grammar and an HSK-style test for professional Chinese.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SyncProvider>
          <Nav />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-4xl px-4 pb-8 text-xs text-muted">
            Dictionary: CC-CEDICT © MDBG, <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.
          </footer>
        </SyncProvider>
      </body>
    </html>
  );
}
