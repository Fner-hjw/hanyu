import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { SyncProvider } from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "Hanyu Easy – Chinese for life & work",
  description: "A complete Chinese learning platform: HSK 1–9 vocabulary, flashcards, listening, speaking, writing, grammar and tests.",
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
  appleWebApp: { capable: true, title: "Hanyu Easy", statusBarStyle: "default" },
  // Google Search Console ownership check (HTML-tag method). GOOGLE_SITE_VERIFICATION in Vercel overrides it.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || "zt-5gLEJ52OYyRQ4BS6dOZHpdhroMdEH_DqywmhIWag" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#c4352b" };

// Self-hosted by next/font: font files are downloaded at build time and served from our own domain,
// so visitors' browsers never contact Google. CJK fonts are split into unicode-range slices,
// so only the glyphs a page actually uses are downloaded.
const inter = Inter({ subsets: ["latin"], variable: "--f-inter", display: "swap" });
const notoSans = Noto_Sans_SC({ subsets: ["latin"], variable: "--f-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_SC({ weight: ["500", "700"], subsets: ["latin"], variable: "--f-noto-serif", display: "swap", preload: false });

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSans.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen">
        <SyncProvider>
          <Shell>{children}</Shell>
        </SyncProvider>
      </body>
    </html>
  );
}
