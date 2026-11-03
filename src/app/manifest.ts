import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hanyu Easy – Chinese for life & work",
    short_name: "Hanyu Easy",
    description: "HSK 1–9 vocabulary, flashcards, listening, speaking, writing, grammar and tests.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e8",
    theme_color: "#c4352b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
