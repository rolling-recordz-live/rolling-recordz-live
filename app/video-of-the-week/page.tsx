"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VideoOfTheWeekPage() {
  const [videos, setVideos] = useState<any[]>([]);

  async function loadVideos() {
    const { data } = await supabase
      .from("artist_uploads")
      .select("*")
      .eq("video_of_week", true)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    setVideos(data || []);
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
        ROLLING RECORDZ PRESENTS
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-8">
        Music Video Of The Week
      </h1>

      <div className="grid gap-8">
        {videos.length ? (
          videos.map((video) => (
            <div key={video.id} className="card">
              <div className="aspect-video rounded-3xl overflow-hidden bg-black mb-5">
                {video.video_url ? (
                  <video
                    src={video.video_url}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : video.cover_url ? (
                  <img
                    src={video.cover_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-4xl font-black">
                    RR
                  </div>
                )}
              </div>

              <h2 className="text-4xl font-black">{video.artist}</h2>
              <p className="text-white/60 mt-2">{video.instagram}</p>
              <p className="text-white/70 mt-4">{video.notes}</p>
            </div>
          ))
        ) : (
          <div className="card text-white/60">
            No Music Video of the Week selected yet.
          </div>
        )}
      </div>
    </section>
  );
}
