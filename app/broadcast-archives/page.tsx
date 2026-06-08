"use client";

import { useEffect, useState } from "react";

export default function BroadcastArchivesPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [status, setStatus] = useState("Loading broadcasts...");

  async function loadVideos() {
    try {
      const res = await fetch("/api/youtube-archives", {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.error) {
        setStatus(json.error);
        return;
      }

      setVideos(json.videos || []);
      setStatus("");
    } catch {
      setStatus("Could not load YouTube broadcasts.");
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-3">
        ROLLING RECORDZ REPLAYS
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-6">
        Broadcast Archives
      </h1>

      <p className="text-white/60 max-w-3xl mb-10 text-xl">
        Watch past Rolling Recordz livestreams, sessions, interviews, reactions,
        creator moments, and late night broadcasts pulled directly from YouTube.
      </p>

      {status && (
        <div className="card text-white/60">
          {status}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {videos.map((video) => (
          <div key={video.id} className="card">
            <div className="aspect-video rounded-3xl overflow-hidden bg-black mb-5">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-2">
              BROADCAST ARCHIVE
            </p>

            <h2 className="text-3xl font-black">
              {video.title}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}
