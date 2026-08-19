/** Emerald Study House — cache only explicit learner downloads; never surprise-download audio on mobile data. */
import type { AudioPackTrack } from "@/data/content/audioPack";

const cacheName = "english-academy-audio-starter-1";

export async function cachedAudioUrl(track: AudioPackTrack): Promise<{ url: string; cached: boolean }> {
  if (!("caches" in window)) return { url: track.url, cached: false };
  const cache = await caches.open(cacheName);
  let response = await cache.match(track.url);
  if (!response && navigator.onLine) {
    const download = await fetch(track.url);
    if (download.ok) { await cache.put(track.url, download.clone()); response = download; }
  }
  if (!response) throw new Error("এই audio track-টি offline-এর জন্য এখনও ডাউনলোড করা হয়নি।");
  return { url: URL.createObjectURL(await response.blob()), cached: true };
}

export async function isAudioCached(track: AudioPackTrack): Promise<boolean> {
  if (!("caches" in window)) return false;
  return Boolean(await (await caches.open(cacheName)).match(track.url));
}
