"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VideoOfTheWeekPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  async function loadVideos() {
    const { data } = await supabase
      .from("artist_uploads")
      .select("*")
      .eq("status", "approved")
      .not("video_url", "eq", "")
      .order("video_votes", { ascending: false });

    setVideos(data || []);
  }

  function getVoterKey() {
    let key = localStorage.getItem("rr_video_voter_key");

    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem("rr_video_voter_key", key);
    }

    return key;
  }

  async function voteVideo(item: any) {
    const voterKey = getVoterKey();
    const today = new Date().toISOString().slice(0, 10);

    const voteAttempt = await supabase.from("video_votes").insert({
      upload_id: item.id,
      voter_key: voterKey,
      vote_day: today,
    });

    if (voteAttempt.error) {
      alert("You already voted for this video today.");
      return;
    }

    await supabase
      .from("artist_uploads")
      .update({
        video_votes: (item.video_votes || 0) + 1,
      })
      .eq("id", item.id);

    loadVideos();
  }

  function playOnly(id: string) {
    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (!video) return;

      if (key === id) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }

  useEffect(() => {
    loadVideos();
  }, []);

  return (
    <section className="h-[calc(100vh-96px)] overflow-y-scroll snap-y snap-mandatory bg-black">
      {videos.length ? (
        videos.map((item) => (
          <div
            key={item.id}
            className="relative h-[calc(100vh-96px)] snap-start flex items-center justify-center overflow-hidden"
            onMouseEnter={() => playOnly(item.id)}
            onTouchStart={() => playOnly(item.id)}
          >
            <video
              ref={(el) => {
                videoRefs.current[item.id] = el;
              }}
              src={item.video_url}
              controls
              playsInline
              loop
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

            <div className="absolute bottom-10 left-5 right-24 z-10">
              <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">
                ROLLING RECORDZ VIDEO
              </p>

              <h1 className="text-4xl md:text-6xl font-black leading-none">
                {item.artist}
              </h1>

              <p className="text-white/70 mt-2">
                {item.instagram || item.genre || "Music Video"}
              </p>

              {item.video_of_week && (
                <p className="mt-4 inline-block rounded-full bg-[#ffd95a] px-4 py-2 text-black font-black">
                  MUSIC VIDEO OF THE WEEK
                </p>
              )}
            </div>

            <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-3">
              <button
                onClick={() => voteVideo(item)}
                className="w-14 h-14 rounded-full bg-black/60 border border-white/20 backdrop-blur font-black text-xl"
              >
                <img src="/icons/star.PNG" alt="Star" className="inline-block w-5 h-5 object-contain align-middle" />
              </button>
              <span className="font-black">{item.video_votes || 0}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex items-center justify-center px-6">
          <div className="card max-w-xl text-center">
            <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-3">
              ROLLING RECORDZ PRESENTS
            </p>

            <h1 className="text-5xl font-black mb-4">
              No Music Videos Yet
            </h1>

            <p className="text-white/60">
              Approved music videos will appear here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
