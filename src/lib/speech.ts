"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal typing for the (prefixed) Web Speech recognition API. */
type RecAlt = { transcript: string; confidence: number };
type RecResult = { isFinal: boolean; length: number; [i: number]: RecAlt };
type RecEvent = { resultIndex: number; results: { length: number; [i: number]: RecResult } };
type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: RecEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecCtor = new () => Recognition;

function getCtor(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
export const recognitionSupported = () => !!getCtor();

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow it in your browser's site settings.",
  "no-speech": "I didn't hear anything — try again a little closer to the mic.",
  "audio-capture": "No microphone was found.",
  network: "Speech recognition needs an internet connection.",
};

/** Chinese characters only, for measuring how much of a sentence has been said. */
const hanzi = (t: string) => t.replace(/[^\u3400-\u9fff]/g, "");

/**
 * Joins final segments. Some recognisers (Chrome on Android) repeat everything heard so far in
 * each new segment; then the new one replaces the old instead of doubling it.
 */
function join(prev: string, next: string): string {
  const a = hanzi(prev), b = hanzi(next);
  if (a && b.startsWith(a)) return next;
  if (b && a.endsWith(b)) return prev;
  return prev + next;
}

/** how long to wait for the learner to start talking, and the longest a single answer may run */
const START_MS = 8000;
const MAX_MS = 45000;

type StartOpts = {
  /** keep listening through any pause until stop() (long spoken answers) */
  continuous?: boolean;
  /** the sentence being repeated: once all of it has been heard, finish after a short pause */
  target?: string;
};

/**
 * Mandarin speech recognition. `alternatives` holds the recogniser's top guesses for the whole answer.
 *
 * By default it listens through short pauses (learners pause mid-sentence) and finishes after a
 * silence: shorter once the whole `target` has been heard, longer while words are still missing.
 */
export function useRecognizer() {
  const rec = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => { clearTimer(); rec.current?.abort(); }, []);

  const start = useCallback((opts?: StartOpts) => {
    const Ctor = getCtor();
    if (!Ctor) { setError("Speech recognition isn't supported in this browser. Try Chrome, Edge or Safari."); return; }
    clearTimer();
    rec.current?.abort();
    const r = new Ctor();
    r.lang = "zh-CN";
    r.interimResults = true;
    r.maxAlternatives = 3;
    // always continuous: the one-phrase mode ends at the first pause, cutting the sentence short
    r.continuous = true;
    setInterim(""); setAlternatives([]); setError(null);

    const want = hanzi(opts?.target ?? "").length;
    let finals: string[] = [];
    let pending = "";
    let heard = false;
    const began = Date.now();
    const finish = () => { clearTimer(); if (rec.current === r) r.stop(); };
    // wait for more speech; the wait depends on whether the answer looks complete
    const arm = () => {
      if (opts?.continuous) return;
      clearTimer();
      const said = hanzi((finals[0] ?? "") + pending).length;
      const wait = !heard ? START_MS : want && said >= want ? 900 : want ? 2500 : 1800;
      timer.current = setTimeout(finish, Math.min(wait, Math.max(0, MAX_MS - (Date.now() - began))));
    };

    r.onresult = (e) => {
      const next: string[] = [];
      let open = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          const before = [...next];
          for (let k = 0; k < Math.max(res.length, before.length, 1); k++) {
            const seg = (res[k] ?? res[0]).transcript;
            const prev = before[k] ?? before[0];
            next[k] = prev === undefined ? seg : join(prev, seg);
          }
        } else open += res[0].transcript;
      }
      finals = next;
      pending = open;
      if (hanzi((finals[0] ?? "") + open)) heard = true;
      setAlternatives(finals);
      setInterim((finals[0] ?? "") + open);
      arm();
    };
    r.onerror = (e) => { if (e.error !== "aborted") setError(ERRORS[e.error] ?? `Recognition error: ${e.error}`); };
    r.onend = () => {
      clearTimer();
      if (rec.current !== r) return;
      // stopped before the last words were finalised: keep them rather than score half a sentence
      if (pending) setAlternatives(finals.length ? finals.map((f) => join(f, pending)) : [pending]);
      else if (!heard) setError((err) => err ?? ERRORS["no-speech"]);
      setListening(false);
    };
    rec.current = r;
    try { r.start(); setListening(true); arm(); } catch { setError("Couldn't start the microphone."); }
  }, []);

  const stop = useCallback(() => { clearTimer(); rec.current?.stop(); }, []);
  const reset = useCallback(() => { setInterim(""); setAlternatives([]); setError(null); }, []);
  return { listening, interim, alternatives, error, start, stop, reset };
}

/** Record the learner's own voice for playback. */
export function useRecorder() {
  const mr = useRef<MediaRecorder | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType })));
        setRecording(false);
      };
      mr.current = rec;
      rec.start();
      setRecording(true);
      setError(null);
    } catch {
      setError("Microphone not available.");
    }
  }, []);
  const stop = useCallback(() => { if (mr.current?.state === "recording") mr.current.stop(); }, []);
  const play = useCallback(() => { if (url) void new Audio(url).play(); }, [url]);
  const clear = useCallback(() => setUrl(null), []);
  return { recording, url, error, start, stop, play, clear };
}
