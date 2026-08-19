/** Design reminder — Emerald Study House: recording states are explicit; no AI analysis is implied. */
import { Circle, Mic, RotateCcw, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type RecordingState = "idle" | "requesting" | "recording" | "ready" | "denied" | "unsupported" | "submitted";

export function RecordingPanel({ prompt }: { prompt: string }) {
  const [state, setState] = useState<RecordingState>("idle");
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => { if (state !== "recording") return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [state]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);
  const release = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setState("unsupported"); return; }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorder.onstop = () => { release(); setState("ready"); };
      recorderRef.current = recorder;
      recorder.start(); setSeconds(0); setState("recording");
    } catch { setState("denied"); }
  };
  const stop = () => recorderRef.current?.state === "recording" && recorderRef.current.stop();
  const retry = () => { stop(); release(); setSeconds(0); setState("idle"); };
  const submit = () => { setState("submitted"); toast.success("তোমার sample recording এই session-এ submitted হয়েছে। এই phase-এ AI pronunciation analysis নেই।"); };
  const statusText: Record<RecordingState, string> = { idle: "রেকর্ড শুরু করার জন্য প্রস্তুত", requesting: "Microphone permission চাওয়া হচ্ছে…", recording: `রেকর্ড হচ্ছে · ${seconds}s`, ready: "রেকর্ড প্রস্তুত · চাইলে আবার করতে পারো", denied: "Microphone permission পাওয়া যায়নি", unsupported: "এই browser-এ recording support নেই", submitted: "Sample recording submitted" };
  return <section className="recording-panel"><p className="card-kicker">Speaking practice</p><h3>{prompt}</h3><p className="recording-status" aria-live="polite"><Circle size={12} className={state === "recording" ? "recording-live" : ""} /> {statusText[state]}</p><div className="recording-actions">{(state === "idle" || state === "denied" || state === "unsupported") && <Button type="button" onClick={() => void start()}><Mic size={16} /> Record</Button>}{state === "requesting" && <Button type="button" disabled>Permission…</Button>}{state === "recording" && <Button type="button" variant="outline" onClick={stop}><Square size={16} /> Stop</Button>}{(state === "ready" || state === "submitted") && <><Button type="button" variant="outline" onClick={retry}><RotateCcw size={16} /> Retry</Button><Button type="button" onClick={submit} disabled={state === "submitted"}><Send size={16} /> Submit</Button></>}</div><small>তোমার audio এই browser থেকে কোথাও upload করা হচ্ছে না।</small></section>;
}
