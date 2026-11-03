import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/** Supabase project (cloud sync and sign-in); falls back to any Supabase project if the env var is unset at build time. */
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") || "https://*.supabase.co";

/**
 * Content-Security-Policy: limits where the page may load code from and send data to, so an injected
 * script can't ship the learner's AI key or session to another site.
 * - connect-src: our own data, Supabase, the bring-your-own-key AI providers, local Ollama, stroke-order CDNs
 * - media-src: recorded sentence audio on GitHub
 * Inline scripts are allowed because pages are prerendered (nonces would force dynamic rendering);
 * React needs eval only in development.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self' blob: https://raw.githubusercontent.com",
  [
    "connect-src 'self'",
    supabase,
    supabase.replace(/^https:/, "wss:"),
    "https://generativelanguage.googleapis.com",
    "https://api.anthropic.com",
    "https://api.openai.com",
    "https://api.deepseek.com",
    "https://openrouter.ai",
    "https://opencode.ai",
    "http://localhost:11434",
    "http://127.0.0.1:11434",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://raw.githubusercontent.com",
  ].join(" "),
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/**
 * Start in report-only mode: browsers log what the policy *would* block (DevTools console) without
 * breaking anything. Once a few days of normal use show no violations, set this to false to enforce it.
 */
const CSP_REPORT_ONLY = true;

const securityHeaders = [
  { key: CSP_REPORT_ONLY ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", value: csp },
  // enforced even while the CSP is report-only: no other site may frame us (clickjacking, e.g. on "Delete account")
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // the speaking exercises need the microphone; nothing needs the camera or location
  { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // the service worker must never be served stale, or updates to it would be delayed
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
