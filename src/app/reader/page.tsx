"use client";

import { useState } from "react";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";

const SAMPLE = "王经理，您好！附件是本季度的预算方案，请查收。如有疑问，请随时联系我。";

export default function Reader() {
  const [text, setText] = useState(SAMPLE);
  const [py, setPy] = useState(true);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reader</h1>
      <p className="text-muted">Paste any Chinese text – an email, a news paragraph, a contract clause. Tap words for pinyin and meaning (words from your list are underlined).</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="han w-full rounded-xl border border-line bg-card p-3 text-lg" />
      <div className="flex items-center gap-3 text-sm">
        <SpeakButton text={text} label="Read aloud" />
        <label className="flex items-center gap-1"><input type="checkbox" checked={py} onChange={(e) => setPy(e.target.checked)} /> Show pinyin</label>
      </div>
      <div className="rounded-xl border border-line bg-card p-4">
        {text.split(/\n+/).map((para, i) => para.trim() && <Annotated key={i} text={para} showPinyin={py} />)}
      </div>
    </div>
  );
}
