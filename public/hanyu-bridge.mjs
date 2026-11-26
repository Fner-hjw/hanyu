#!/usr/bin/env node
/**
 * Hanyu Easy – local AI bridge.
 *
 * Lets the Hanyu Easy website use the AI command-line tools already installed and signed in on
 * this computer (Claude Code, OpenAI Codex, Mistral Vibe) instead of an API key. A web page can't
 * start programs on your computer by itself, so this small script does it for the page:
 *
 *   website (your browser) ──► http://127.0.0.1:11435 (this script) ──► claude / codex / vibe
 *
 * Everything stays on this computer: the script only listens on 127.0.0.1, answers only pages
 * that present the pairing token it prints, and the text goes from your browser to the CLI and
 * from the CLI to its own provider, never through the Hanyu server.
 * The CLIs run with their tools switched off, in an empty temporary folder, so they can only reply
 * with text: they can't read your files or run commands.
 *
 * Usage:   node hanyu-bridge.mjs [--port 11435] [--origin https://your-hanyu-site.example]
 * Needs Node.js 18 or newer, and no packages.
 *
 * Options (or environment variables):
 *   --port <n>        HANYU_BRIDGE_PORT     port to listen on (default 11435)
 *   --origin <url>    HANYU_BRIDGE_ORIGINS  extra site address allowed to connect (repeatable /
 *                                           comma-separated). Without it any site may try, but
 *                                           only one that has the pairing token gets an answer.
 *   --new-token                             forget the saved pairing token and make a new one
 */
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const VERSION = 1;
const IS_WIN = process.platform === "win32";
const MAX_BODY = 512 * 1024; // a long conversation is still far below this
const TIMEOUT_MS = 4 * 60 * 1000;
const MAX_RUNNING = 2;

/* ---------- options ---------- */
const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
const allOpts = (name) => argv.flatMap((a, i) => (a === name && argv[i + 1] ? [argv[i + 1]] : []));
if (argv.includes("--help") || argv.includes("-h")) {
  console.log("Usage: node hanyu-bridge.mjs [--port 11435] [--origin https://your-hanyu-site.example] [--new-token]");
  process.exit(0);
}
const PORT = Number(opt("--port") ?? process.env.HANYU_BRIDGE_PORT ?? 11435);
const ORIGINS = [...allOpts("--origin"), ...(process.env.HANYU_BRIDGE_ORIGINS ?? "").split(",")]
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

/* ---------- pairing token, kept in ~/.hanyu-bridge/config.json ---------- */
const CONF_DIR = join(homedir(), ".hanyu-bridge");
const CONF = join(CONF_DIR, "config.json");
function loadToken() {
  if (!argv.includes("--new-token")) {
    try {
      const t = JSON.parse(readFileSync(CONF, "utf8")).token;
      if (typeof t === "string" && t.length >= 32) return t;
    } catch { /* first run */ }
  }
  const token = "hb_" + randomBytes(24).toString("base64url");
  try {
    mkdirSync(CONF_DIR, { recursive: true, mode: 0o700 });
    writeFileSync(CONF, JSON.stringify({ token }, null, 2), { mode: 0o600 });
  } catch (e) {
    console.warn("Couldn't save the pairing token (it will change next time):", e.message);
  }
  return token;
}
const TOKEN = loadToken();
const tokenOk = (h) => {
  const got = Buffer.from(String(h ?? "").replace(/^Bearer\s+/i, ""));
  const want = Buffer.from(TOKEN);
  return got.length === want.length && timingSafeEqual(got, want);
};

/* ---------- the CLIs ---------- */
const CLIS = {
  claude: { name: "Claude Code", bin: "claude", install: "https://docs.claude.com/en/docs/claude-code" },
  codex: { name: "OpenAI Codex", bin: "codex", install: "https://github.com/openai/codex" },
  vibe: { name: "Mistral Vibe", bin: "vibe", install: "https://github.com/mistralai/mistral-vibe" },
};

function detect() {
  const out = {};
  for (const [id, c] of Object.entries(CLIS)) {
    const r = spawnSync(c.bin, ["--version"], { encoding: "utf8", timeout: 15000, shell: IS_WIN, windowsHide: true });
    const v = (r.stdout || "").trim().split("\n")[0];
    out[id] = r.status === 0 ? { name: c.name, available: true, version: v } : { name: c.name, available: false, install: c.install };
  }
  return out;
}
let detected = detect();

/** model names go on the command line, so allow only plain ids */
const MODEL_RE = /^[\w.:/@[\]-]{1,100}$/;

/** The CLIs take one prompt, so a multi-turn conversation is written out as a transcript. */
function transcript(messages) {
  if (messages.length === 1) return messages[0].content;
  const lines = messages.map((m) => `${m.role === "user" ? "LEARNER" : "YOU"}:\n${m.content}`);
  return [
    "Here is the conversation so far.",
    "",
    lines.join("\n\n"),
    "",
    "Write your next reply to the learner's last message. Output only the reply itself, with no \"YOU:\" label.",
  ].join("\n");
}

/** Builds the command for one request. System prompts go in files so the command line stays short and safe. */
function command(cli, { model, effort }, dir, system) {
  const sysFile = join(dir, "system.txt");
  writeFileSync(sysFile, system);
  if (cli === "claude") {
    const args = [
      "-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages",
      "--system-prompt-file", sysFile,
      "--tools", "", "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence",
    ];
    if (model) args.push("--model", model);
    if (effort) args.push("--effort", effort);
    return { args, parse: "claude-stream", promptPrefix: "" };
  }
  if (cli === "codex") {
    const last = join(dir, "last.txt");
    const args = ["exec", "--skip-git-repo-check", "--ephemeral", "--sandbox", "read-only", "--color", "never", "-C", dir, "-o", last];
    if (model) args.push("-m", model);
    args.push("-");
    return { args, parse: "file", file: last, promptPrefix: `<instructions>\n${system}\n</instructions>\n\n` };
  }
  // vibe
  const args = ["--workdir", dir, "--system-prompt-file", sysFile, "--max-turns", "1", "--output", "text", "-p"];
  if (model) args.splice(0, 0, "--model", model);
  return { args, parse: "text", promptPrefix: "" };
}

let running = 0;

async function handleChat(req, res, body) {
  const { cli, model, system, messages, effort } = body;
  if (!CLIS[cli]) return json(res, 400, { error: "Unknown CLI." });
  if (!detected[cli]?.available) detected = detect();
  if (!detected[cli]?.available) return json(res, 400, { error: `${CLIS[cli].name} isn't installed on this computer (or isn't on the PATH of the terminal running the bridge).` });
  if (model && !MODEL_RE.test(model)) return json(res, 400, { error: "That model name has characters the bridge doesn't accept." });
  if (typeof system !== "string" || !Array.isArray(messages) || !messages.length || messages.some((m) => typeof m?.content !== "string" || !["user", "assistant"].includes(m.role)))
    return json(res, 400, { error: "Malformed request." });
  if (running >= MAX_RUNNING) return json(res, 429, { error: "The bridge is already answering other requests. Try again in a moment." });

  running++;
  const dir = mkdtempSync(join(tmpdir(), "hanyu-bridge-"));
  const cmd = command(cli, { model, effort: ["low", "medium", "high"].includes(effort) ? effort : undefined }, dir, system);
  // Windows runs the CLIs' .cmd shims through the shell, so quote every argument (paths may hold spaces; "" must survive)
  const args = IS_WIN ? cmd.args.map((a) => `"${a}"`) : cmd.args;
  const child = spawn(CLIS[cli].bin, args, { cwd: dir, shell: IS_WIN, windowsHide: true, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, NO_COLOR: "1" } });

  let text = "";
  let stderr = "";
  let started = false;
  let finished = false;
  const send = (obj) => {
    if (!started) {
      started = true;
      res.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", ...cors(req) });
    }
    res.write(JSON.stringify(obj) + "\n");
  };
  const finish = (err) => {
    if (finished) return;
    finished = true;
    running--;
    clearTimeout(timer);
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
    if (err) {
      if (started) { send({ error: err }); res.end(); } else json(res, 502, { error: err });
    } else {
      send({ done: true, text });
      res.end();
    }
  };
  const timer = setTimeout(() => { child.kill(); finish("The CLI took too long to answer."); }, TIMEOUT_MS);
  // the page went away or pressed Stop
  res.on("close", () => { if (!finished) { child.kill(); finish("Stopped."); } });

  let buf = "";
  let claudeResult = null;
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    if (cmd.parse === "text") {
      text += chunk;
      send({ text });
      return;
    }
    if (cmd.parse !== "claude-stream") return;
    buf += chunk;
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      let ev;
      try { ev = JSON.parse(line); } catch { continue; }
      if (ev.type === "stream_event" && !ev.parent_tool_use_id && ev.event?.type === "content_block_delta" && ev.event.delta?.type === "text_delta") {
        text += ev.event.delta.text;
        send({ text });
      } else if (ev.type === "result") {
        claudeResult = ev;
      }
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (c) => { stderr = (stderr + c).slice(-4000); });
  child.on("error", (e) => finish(e.code === "ENOENT" ? `${CLIS[cli].name} isn't installed on this computer.` : `Couldn't start ${CLIS[cli].name}: ${e.message}`));
  child.on("close", (code) => {
    if (finished) return;
    if (cmd.parse === "file") {
      try { text = readFileSync(cmd.file, "utf8").trim(); } catch { /* no answer written */ }
    }
    if (claudeResult?.is_error) return finish(cliError(cli, String(claudeResult.result ?? claudeResult.subtype ?? "")));
    if (cmd.parse === "claude-stream" && !text && typeof claudeResult?.result === "string") text = claudeResult.result;
    if (code !== 0 && !text) return finish(cliError(cli, stderr));
    if (!text.trim()) return finish(cliError(cli, stderr || "The CLI returned an empty answer."));
    finish();
  });

  child.stdin.on("error", () => { /* the process exited early; reported on close */ });
  child.stdin.end(cmd.promptPrefix + transcript(messages));
}

/** last meaningful line of the CLI's error output, plus a hint for the usual cause */
function cliError(cli, raw) {
  const lines = String(raw).replace(/\x1b\[[0-9;]*m/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const last = lines.slice(-3).join(" ").slice(0, 400);
  const login = /log ?in|auth|api[ _-]?key|unauthori[sz]ed|credential|401/i.test(last);
  const hint = login ? ` Open a terminal and run \`${CLIS[cli].bin}\` once to sign in.` : "";
  return `${CLIS[cli].name} failed${last ? `: ${last}` : "."}${hint}`;
}

/* ---------- HTTP ---------- */
function originAllowed(origin) {
  if (!origin) return true; // not a browser page (e.g. curl); the token still protects it
  if (!ORIGINS.length) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return ORIGINS.includes(origin);
}
function cors(req) {
  const origin = req.headers.origin;
  if (!origin || !originAllowed(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    // Chrome's Private/Local Network Access: a public site may reach this local server
    "Access-Control-Allow-Private-Network": "true",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}
function json(res, status, obj) {
  if (res.headersSent) return;
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors(res.req) });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  // reject DNS-rebinding: the Host must be this machine
  const host = String(req.headers.host ?? "").replace(/:\d+$/, "");
  if (!["127.0.0.1", "localhost", "[::1]"].includes(host)) return json(res, 403, { error: "Bad host." });
  if (!originAllowed(req.headers.origin)) {
    console.warn(`Refused a request from ${req.headers.origin} (not in --origin).`);
    return json(res, 403, { error: "This site isn't allowed to use the bridge. Restart it with --origin <this site's address>." });
  }
  if (req.method === "OPTIONS") { res.writeHead(204, cors(req)); return res.end(); }
  if (!tokenOk(req.headers.authorization)) return json(res, 401, { error: "Wrong or missing pairing token." });

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  if (req.method === "GET" && url.pathname === "/health") {
    if (url.searchParams.has("refresh")) detected = detect();
    return json(res, 200, { ok: true, bridge: "hanyu", version: VERSION, clis: detected });
  }
  if (req.method === "POST" && url.pathname === "/chat") {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { json(res, 413, { error: "Request too large." }); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      if (res.headersSent) return;
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return json(res, 400, { error: "Malformed request." }); }
      handleChat(req, res, body).catch((e) => json(res, 500, { error: String(e?.message ?? e) }));
    });
    return;
  }
  json(res, 404, { error: "Not found." });
});

server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} is already in use. Is the bridge already running? Or pick another with --port.` : e.message);
  process.exit(1);
});
server.listen(PORT, "127.0.0.1", () => {
  const found = Object.entries(detected).map(([, c]) => `  ${c.available ? "✓" : "✗"} ${c.name}${c.available ? ` (${c.version})` : " – not found"}`).join("\n");
  console.log(`
Hanyu Easy local AI bridge is running on http://127.0.0.1:${PORT}

${found}

Pairing token (paste it in Hanyu Easy → Account → AI assistant → Local CLI):

  ${TOKEN}

${ORIGINS.length ? `Allowed sites: ${ORIGINS.join(", ")} (and localhost)` : "Tip: add --origin <your Hanyu site address> to refuse every other site outright."}
Leave this window open while you practise. Press Ctrl+C to stop.
`);
});
