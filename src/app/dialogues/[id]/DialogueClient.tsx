"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DIALOGUES } from "@/data/dialogues";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { speak, stopSpeaking } from "@/lib/audio";
import { saveDialogueScore, updateSettings, useAppState } from "@/lib/store";

export default function DialogueClient({ id }: { id: string }) {
  const d = DIALOGUES.find((x) => x.id === id);
  const s = useAppState();
  const [showEn, setShowEn] = useState(true);
  const [showPy, setShowPy] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const stopRef = useRef(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  if (!d) return <p>Dialogue not found. <Link className="underline" href="/dialogues">Back</Link></p>;

  const playAll = async () => {
    stopRef.current = false;
    for (let i = 0; i < d.lines.length; i++) {
      if (stopRef.current) break;
      setPlaying(i);
      await speak(d.lines[i].zh, s.settings.speed);
    }
    setPlaying(null);
  };
  const stop = () => { stopRef.current = true; stopSpeaking(); setPlaying(null); };

  const score = Math.round((d.questions.filter((q, i) => answers[i] === q.answer).length / d.questions.length) * 100);

  return (
    <div className="space-y-5">
      <Link href="/dialogues" className="text-sm text-muted underline">← All dialogues</Link>
      <div>
        <h1 className="han text-2xl font-semibold">{d.titleZh}</h1>
        <p className="text-muted">{d.title} — {d.intro}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button onClick={playAll} className="rounded-full bg-accent px-4 py-1.5 text-white">▶ Play all</button>
        <button onClick={stop} className="rounded-full border border-line px-4 py-1.5">■ Stop</button>
        <label className="flex items-center gap-1"><input type="checkbox" checked={showPy} onChange={(e) => setShowPy(e.target.checked)} /> Pinyin</label>
        <label className="flex items-center gap-1"><input type="checkbox" checked={showEn} onChange={(e) => setShowEn(e.target.checked)} /> English</label>
        <label className="flex items-center gap-1">Speed
          <select className="rounded border border-line bg-bg px-1 py-0.5" value={s.settings.speed} onChange={(e) => updateSettings({ speed: +e.target.value })}>
            <option value={0.6}>0.6×</option><option value={0.75}>0.75×</option><option value={0.9}>0.9×</option><option value={1.1}>1.1×</option>
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {d.lines.map((l, i) => (
          <div key={i} className={`rounded-xl border bg-card p-3 ${playing === i ? "border-accent" : "border-line"}`}>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted">
              <SpeakButton text={l.zh} rate={s.settings.speed} />
              <span>{l.who}</span>
              <Recorder />
            </div>
            <Annotated text={l.zh} showPinyin={showPy} />
            {showEn && <p className="mt-1 text-sm text-muted">{l.en}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-card p-4">
        <h2 className="mb-3 font-medium">Comprehension</h2>
        {d.questions.map((q, qi) => (
          <div key={qi} className="mb-4">
            <p className="han mb-1">{qi + 1}. {q.q}</p>
            {q.options.map((o, oi) => {
              const picked = answers[qi] === oi;
              const right = checked && oi === q.answer;
              const wrong = checked && picked && oi !== q.answer;
              return (
                <button key={oi} disabled={checked} onClick={() => setAnswers({ ...answers, [qi]: oi })}
                  className={`han mb-1 block w-full rounded-lg border px-3 py-1.5 text-left ${right ? "border-good bg-good/10" : wrong ? "border-accent bg-accent-soft" : picked ? "border-accent" : "border-line"}`}>
                  {o}
                </button>
              );
            })}
          </div>
        ))}
        {!checked ? (
          <button disabled={Object.keys(answers).length < d.questions.length} className="rounded-full bg-accent px-5 py-1.5 text-white disabled:opacity-40"
            onClick={() => { setChecked(true); saveDialogueScore(d.id, score); }}>Check answers</button>
        ) : <p className="font-medium">Score: {score}%</p>}
      </div>
    </div>
  );
}

/** Record yourself and play back – shadowing practice. */
function Recorder() {
  const [state, setState] = useState<"idle" | "rec" | "ready">("idle");
  const rec = useRef<MediaRecorder | null>(null);
  const url = useRef<string | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        url.current = URL.createObjectURL(new Blob(chunks));
        setState("ready");
      };
      rec.current = mr;
      mr.start();
      setState("rec");
    } catch {
      alert("Microphone not available.");
    }
  };
  return (
    <span className="ml-auto flex gap-1">
      {state !== "rec" ? (
        <button onClick={start} className="rounded-full border border-line px-2 py-0.5 text-xs hover:bg-accent-soft">🎙 Record</button>
      ) : (
        <button onClick={() => rec.current?.stop()} className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">■ Stop</button>
      )}
      {state === "ready" && (
        <button onClick={() => url.current && new Audio(url.current).play()} className="rounded-full border border-line px-2 py-0.5 text-xs hover:bg-accent-soft">▶ Mine</button>
      )}
    </span>
  );
}
