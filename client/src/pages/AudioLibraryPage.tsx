/** Emerald Study House — a small downloadable listening shelf, not a streaming catalogue. */
import { CheckCircle2, Download, Headphones, Play, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { starterAudioPack, type AudioPackTrack } from "@/data/content/audioPack";
import { cachedAudioUrl, isAudioCached } from "@/lib/offlineAudio";

export default function AudioLibraryPage() {
  const player = useRef<HTMLAudioElement | null>(null); const [cached, setCached] = useState<Record<string, boolean>>({}); const [active, setActive] = useState<string>(); const [notice, setNotice] = useState<string>();
  useEffect(() => { void Promise.all(starterAudioPack.map(async (track) => [track.id, await isAudioCached(track)] as const)).then((items) => setCached(Object.fromEntries(items))); }, []);
  const play = async (track: AudioPackTrack) => { try { const asset = await cachedAudioUrl(track); if (player.current) { player.current.src = asset.url; await player.current.play(); setActive(track.id); setCached((value) => ({ ...value, [track.id]: asset.cached })); } } catch (error) { setNotice(error instanceof Error ? error.message : "Audio চালু করা যায়নি।"); } };
  return <AppShell eyebrow="Offline pronunciation" title="Audio practice shelf"><section className="audio-library-intro paper-card"><div><p className="card-kicker">Starter audio pack · 3 tracks</p><h2>শুনো, থেমে বলো, আবার শুনো।</h2><p>Track-এ একবার tap করলে সেটি এই device-এর browser cache-এ রাখা হবে। পরে internet ছাড়াও শুনতে পারবে।</p></div><WifiOff size={34} aria-hidden="true" /></section><audio ref={player} onEnded={() => setActive(undefined)} /><section className="audio-track-list" aria-label="Offline audio tracks">{starterAudioPack.map((track) => <article key={track.id} className="audio-track paper-card"><span className="audio-track-icon"><Headphones size={18} /></span><div><p>{track.level} · {track.durationLabel}</p><h2>{track.title}</h2><strong>{track.banglaTitle}</strong><small>{track.transcript}</small></div><div className="audio-track-actions"><span className={cached[track.id] ? "audio-cached" : "audio-online"}>{cached[track.id] ? <><CheckCircle2 size={14} /> Offline ready</> : <><Download size={14} /> Tap to save</>}</span><Button type="button" onClick={() => void play(track)}><Play size={15} fill="currentColor" /> {active === track.id ? "Playing" : "Play"}</Button></div></article>)}</section>{notice ? <p className="audio-notice">{notice}</p> : null}</AppShell>;
}
