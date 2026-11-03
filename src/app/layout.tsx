import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { SyncProvider } from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "Hànyǔ – Chinese for life & work",
  description: "A complete Chinese learning platform: HSK 1–9 vocabulary, flashcards, listening, speaking, writing, grammar and tests.",
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Hànyǔ", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#c4352b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* App Router root layout applies to every page, so this lint rule (written for pages/) doesn't apply.
            CJK fonts load via Google's unicode-range slices: only glyphs actually used are downloaded. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <SyncProvider>
          <Shell>{children}</Shell>
        </SyncProvider>
      </body>
    </html>
  );
}
