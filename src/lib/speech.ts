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

/** Mandarin speech recognition. `alternatives` holds the recogniser's top guesses for the final result. */
export function useRecognizer() {
  const rec = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => rec.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) { setError("Speech recognition isn't supported in this browser. Try Chrome, Edge or Safari."); return; }
    rec.current?.abort();
    const r = new Ctor();
    r.lang = "zh-CN";
    r.interimResults = true;
    r.maxAlternatives = 3;
    r.continuous = false;
    setInterim(""); setAlternatives([]); setError(null);
    r.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        text += res[0].transcript;
        if (res.isFinal) {
          const alts: string[] = [];
          for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
          setAlternatives((prev) => (prev.length ? prev.map((p, k) => p + (alts[k] ?? alts[0])) : alts));
        }
      }
      setInterim(text);
    };
    r.onerror = (e) => { if (e.error !== "aborted") setError(ERRORS[e.error] ?? `Recognition error: ${e.error}`); };
    r.onend = () => setListening(false);
    rec.current = r;
    try { r.start(); setListening(true); } catch { setError("Couldn't start the microphone."); }
  }, []);

  const stop = useCallback(() => rec.current?.stop(), []);
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
