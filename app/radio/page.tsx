"use client";

import { useEffect, useRef, useState } from "react";
import LiveChat from "@/components/LiveChat";

const SLOT_SECONDS = 180;

export default function RadioPage() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
const [displayTrack, setDisplayTrack] = useState<any>(null);
  const [status, setStatus] = useState("Loading station...");
  const [worldUrl, setWorldUrl] = useState("");
  const [genre, setGenre] = useState("All");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function genreKey(value: string) {
    return value
      .toLowerCase()
      .replace("&", "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function pickTrack(list: any[]) {
    if (!list.length) return null;
    const now = Math.floor(Date.now() / 1000);
    const offset = now % SLOT_SECONDS;

    const weighted: any[] = [];

    list.forEach((track) => {
      const weight = Math.min(
        25,
        Math.max(1, Number(track.votes || 0) + Number(track.stars || 0))
      );

      for (let i = 0; i < weight; i++) {
        weighted.push(track);
      }
    });

    const index = Math.floor(now / SLOT_SECONDS) % weighted.length;

    return { track: weighted[index], offset };
  }

  async function loadWorld() {
    const key = genre === "All" ? "radio_world_url" : `radio_world_url_${genreKey(genre)}`;

    const res = await fetch(`/api/site-setting?key=${encodeURIComponent(key)}&ts=${Date.now()}`, {
      cache: "no-store",
    });

    const json = await res.json();

    if (json.value) {
      setWorldUrl(json.value);
      return;
    }

    const fallback = await fetch(`/api/site-setting?key=radio_world_url&ts=${Date.now()}`, {
      cache: "no-store",
    });

    const fallbackJson = await fallback.json();
    setWorldUrl(fallbackJson.value || "");
  }

  async function loadTracks() {
    const res = await fetch(`/api/radio-tracks?genre=${encodeURIComponent(genre)}&ts=${Date.now()}`, {
      cache: "no-store",
    });

    const json = await res.json();
    const list = json.tracks || [];

    setTracks(list);

    if (list.length) {
      if (!currentTrack) setCurrentTrack(list[0]);
      setStatus(`Loaded ${list.length} tracks. Tap PLAY.`);
    } else {
      setCurrentTrack(null);
      setStatus("No approved audio tracks yet.");
    }
  }

  function fadeAudio(target: number, done?: () => void) {
    const audio = audioRef.current;
    if (!audio) return;

    const step = target > audio.volume ? 0.05 : -0.05;

    const fade = setInterval(() => {
      if (!audioRef.current) return clearInterval(fade);

      audio.volume = Math.max(0, Math.min(1, audio.volume + step));

      if ((step > 0 && audio.volume >= target) || (step < 0 && audio.volume <= target)) {
        clearInterval(fade);
        if (done) done();
      }
    }, 60);
  }

  async function playStation() {
    const picked = pickTrack(tracks);

    if (!picked || !audioRef.current) {
      setStatus("No playable track loaded.");
      return;
    }

    setCurrentTrack(picked.track);
setDisplayTrack(picked.track);

    try {
      const audio = audioRef.current;
      audio.src = picked.track.song_url;
      audio.load();

      audio.onloadedmetadata = async () => {
        const duration = audio.duration || SLOT_SECONDS;
        audio.currentTime = picked.offset % duration;
        audio.volume = 1;
        audio.muted = false;

        audio.volume = 0;
        await audio.play();
        fadeAudio(1);
        setStatus(`LIVE • ${Math.floor(audio.currentTime)}s into record`);
      };
    } catch {
      setStatus("Playback blocked. Tap PLAY again.");
    }
  }

  useEffect(() => {
    loadTracks();
    loadWorld();
    const timer = setInterval(loadTracks, 30000);
    return () => clearInterval(timer);
  }, [genre]);

  return (
    <section className="px-4 md:px-10 pt-2 pb-6">
      <div className="grid xl:grid-cols-[1fr_420px] gap-5">
        <div className="relative min-h-[82vh] overflow-hidden rounded-[28px] border border-[#25c8ff]/25 bg-black">
          {worldUrl ? (
            worldUrl.match(/\.(mp4|mov|webm)$/i) ? (
              <video
                src={worldUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
            ) : (
              <img
                src={worldUrl}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#06131f] to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />

          <div className="relative z-10 flex h-full min-h-[82vh] items-end p-5 md:p-8">
            <div className="grid w-full lg:grid-cols-[330px_1fr] gap-6 items-end">
              <div className="relative aspect-square overflow-hidden rounded-[26px] border border-[#ffd95a]/25 bg-black">
                <div className="absolute left-0 top-0 z-10 bg-black/70 px-4 py-2 text-xs font-black tracking-[.3em] text-[#ffd95a]">
                  NOW PLAYING
                </div>

                <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-red-600/80 px-3 py-2 text-xs font-black">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  ON AIR
                </div>

                {displayTrack?.video_url ? (
                  <video
                    src={displayTrack.video_url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : displayTrack?.cover_url ? (
                  <img
                    src={displayTrack.cover_url}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl font-black text-white/30">
                    RR
                  </div>
                )}
              </div>

              <div>
                <p className="text-[#ffd95a] tracking-[.35em] text-xs font-black mb-3">
                  ROLLING RECORDZ LIVE BROADCAST
                </p>

                <h1 className="text-6xl md:text-8xl font-black leading-[.82] tracking-[-.06em]">
                  {displayTrack?.artist || "NO TRACKS"}
                </h1>

                <p className="mt-3 text-xl text-white/70 font-bold">
                  {displayTrack?.instagram || "Waiting for approved music"}
                </p>

                <audio
                  ref={audioRef}
                  className="hidden"
                  onEnded={() => {
                    fadeAudio(0, () => {
                      playStation();
                    });
                  }}
                />

                <div className="mt-4">
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-black"
                  >
                    <option>All</option>
                    <option>Underground</option>
                    <option>Hip Hop</option>
                    <option>Rap</option>
                    <option>R&B</option>
                    <option>Pop</option>
                    <option>Afrobeats</option>
                    <option>House</option>
                    <option>Trap</option>
                    <option>Gospel</option>
                    <option>Alternative</option>
                    <option>Late Night Frequencies</option>
                  </select>
                </div>


                <div className="mt-5 rounded-3xl border border-white/10 bg-black/60 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs tracking-[.3em] text-[#ffd95a] font-black">
                        LIVE BROADCAST
                      </p>
                      <p className="text-white/70 text-sm">
                        Live station mode
                      </p>
                    </div>

                    <button onClick={playStation} className="rounded-full bg-[#ffd95a] px-5 py-3 font-black text-black">
                      PLAY / RESYNC
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-sm text-[#ffd95a] font-bold">{status}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="border border-[#25c8ff]/20 bg-black/70 p-5 rounded-[24px]">
            <h2 className="text-3xl font-black mb-5">Live Queue</h2>

            <div className="space-y-4">
              {tracks.map((track, i) => (
                <div key={track.id} className="flex items-center gap-4 border-b border-white/10 pb-4">
                  {track.cover_url ? (
                    <img src={track.cover_url} className="w-16 h-16 rounded-xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-black flex items-center justify-center">RR</div>
                  )}

                  <div>
                    <p className="font-black">{i + 1}. {track.artist}</p>
                    <p className="text-sm text-white/60">{track.instagram}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LiveChat />
        </aside>
      </div>
    </section>
  );
}
