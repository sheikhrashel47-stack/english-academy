/** Emerald Study House: audio stays on this device; the UI never implies automatic pronunciation scoring. */
import { Circle, Mic, Play, RotateCcw, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type RecordingState = "idle" | "requesting" | "recording" | "ready" | "denied" | "unsupported" | "submitted";
type RecordingPanelProps = { prompt: string; title?: string; onSubmit?: (input: { seconds: number; hasRecording: boolean }) => Promise<void> | void; onSelfReflection?: () => Promise<void> | void };

export function RecordingPanel({ prompt, title = "Speaking practice", onSubmit, onSelfReflection }: RecordingPanelProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string>();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const release = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };

  useEffect(() => { if (state !== "recording") return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [state]);
  useEffect(() => () => release(), []);
  useEffect(() => () => { if (recordingUrl) URL.revokeObjectURL(recordingUrl); }, [recordingUrl]);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setState("unsupported"); return; }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        release();
        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audio.size) setRecordingUrl(URL.createObjectURL(audio));
        setState("ready");
      };
      recorderRef.current = recorder;
      recorder.start(); setSeconds(0); setState("recording");
    } catch { setState("denied"); }
  };
  const stop = () => { if (recorderRef.current?.state === "recording") recorderRef.current.stop(); };
  const retry = () => { stop(); release(); if (recordingUrl) URL.revokeObjectURL(recordingUrl); setRecordingUrl(undefined); setSeconds(0); setState("idle"); };
  const submit = async () => { await onSubmit?.({ seconds, hasRecording: Boolean(recordingUrl) }); setState("submitted"); toast.success("তোমার local recording attempt সংরক্ষিত হয়েছে। AI pronunciation score দেওয়া হচ্ছে না।"); };
  const reflect = async () => { await onSelfReflection?.(); setState("submitted"); toast.success("তোমার self-reflection attempt সংরক্ষিত হয়েছে।"); };
  const statusText: Record<RecordingState, string> = { idle: "রেকর্ড শুরু করার জন্য প্রস্তুত", requesting: "Microphone permission চাওয়া হচ্ছে…", recording: `রেকর্ড হচ্ছে · ${seconds}s`, ready: "রেকর্ড প্রস্তুত · replay করে চাইলে আবার করতে পারো", denied: "Microphone permission পাওয়া যায়নি", unsupported: "এই browser-এ recording support নেই", submitted: "Local attempt submitted" };

  return <section className="recording-panel"><p className="card-kicker">{title}</p><h3>{prompt}</h3><p className="recording-status" aria-live="polite"><Circle size={12} className={state === "recording" ? "recording-live" : ""} /> {statusText[state]}</p><div className="recording-actions">{(state === "idle" || state === "denied" || state === "unsupported") && <Button type="button" onClick={() => void start()}><Mic size={16} /> Record</Button>}{state === "requesting" && <Button type="button" disabled>Permission…</Button>}{state === "recording" && <Button type="button" variant="outline" onClick={stop}><Square size={16} /> Stop</Button>}{recordingUrl && <audio className="recording-playback" controls src={recordingUrl}><track kind="captions" /></audio>}{(state === "ready" || state === "submitted") && <><Button type="button" variant="outline" onClick={retry}><RotateCcw size={16} /> Retry</Button><Button type="button" onClick={() => void submit()} disabled={state === "submitted"}><Send size={16} /> Submit</Button></>}{(state === "denied" || state === "unsupported") && <Button type="button" variant="outline" onClick={() => void reflect()}><Play size={16} /> Complete with reflection</Button>}</div><small>তোমার audio কোথাও upload করা হয় না; local replay কেবল এই browser session-এ থাকে।</small></section>;
}
