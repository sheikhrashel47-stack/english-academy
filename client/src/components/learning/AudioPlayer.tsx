/** Design reminder — Emerald Study House: browser speech is a transparent fallback, never simulated audio. */
/** Emerald Study House: quiet, capability-honest local playback for reusable skill activities. */
import { Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function AudioPlayer({ label, text, transcript, transcriptAvailable = true, onCompleted }: { label: string; text: string; transcript?: string; transcriptAvailable?: boolean; onCompleted?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.85);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const available = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = () => { if (available) window.speechSynthesis.cancel(); setPlaying(false); };
  const speak = () => {
    if (!available) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = speed;
    utterance.volume = volume;
    utterance.onboundary = (event) => setProgress(Math.min(100, Math.round((event.charIndex / Math.max(1, text.length)) * 100)));
    utterance.onend = () => { setPlaying(false); setProgress(100); onCompleted?.(); };
    utterance.onerror = () => setPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };
  const toggle = () => {
    if (!available) return;
    if (playing) { window.speechSynthesis.pause(); setPlaying(false); }
    else if (window.speechSynthesis.paused && utteranceRef.current) { window.speechSynthesis.resume(); setPlaying(true); }
    else speak();
  };
  const replay = () => { stop(); setProgress(0); window.setTimeout(speak, 30); };
  useEffect(() => () => { if (available) window.speechSynthesis.cancel(); }, [available]);

  return <section className="audio-player" aria-label={`${label} audio player`}>
    <div className="audio-player-heading"><span className="audio-player-icon"><Volume2 size={18} /></span><div><strong>{label}</strong><small>{available ? "Browser voice sample · local device" : "এই browser-এ audio playback পাওয়া যায়নি"}</small></div></div>
    <div className="audio-progress" aria-label={`Playback progress ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
    <div className="audio-player-controls"><Button type="button" size="icon" variant="outline" disabled={!available} onClick={toggle} aria-label={playing ? "Pause audio" : "Play audio"}>{playing ? <Pause size={17} /> : <Play size={17} />}</Button><Button type="button" variant="outline" disabled={!available} onClick={replay}><RotateCcw size={16} /> Replay</Button><label>Speed<select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} disabled={!available} aria-label="Playback speed"><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option></select></label><label className="audio-volume">Volume<input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} disabled={!available} aria-label="Playback volume" /></label></div>
    {transcript && (transcriptAvailable ? <details className="audio-transcript"><summary>Transcript দেখো</summary><p>{transcript}</p></details> : <p className="audio-transcript-locked">Assessment শেষ করলে transcript দেখা যাবে।</p>)}
  </section>;
}
