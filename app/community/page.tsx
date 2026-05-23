"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CommunityPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await supabase
      .from("artist_uploads")
      .select("*")
      .eq("status", "approved")
      .order("votes", { ascending: false });

    setArtists(data || []);
  }

  async function vote(artist: any) {
    await supabase
      .from("artist_uploads")
      .update({
        votes: (artist.votes || 0) + 1,
        stars: (artist.stars || 0) + 1,
      })
      .eq("id", artist.id);

    load();
  }

  async function addComment(artist: any) {
    const text = commentText[artist.id]?.trim();
    if (!text) return;

    const current = Array.isArray(artist.comments) ? artist.comments : [];

    await supabase
      .from("artist_uploads")
      .update({
        comments: [
          ...current,
          {
            name: "Listener",
            text,
            date: new Date().toISOString(),
          },
        ],
      })
      .eq("id", artist.id);

    setCommentText({ ...commentText, [artist.id]: "" });
    load();
  }

  useEffect(() => {
    load();

    const channel = supabase
      .channel("community-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "artist_uploads" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featured = artists.find((a) => a.featured) || artists[0];

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="mb-10">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          THE MOVEMENT
        </p>

        <h1 className="text-6xl md:text-8xl font-black">
          Community
        </h1>

        <p className="text-white/60 mt-4 max-w-2xl">
          Vote, comment, support artists, and help decide who rises inside
          Rolling Recordz.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="grid gap-6">
          {featured && (
            <div className="card">
              <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
                FEATURED ARTIST
              </p>

              <div className="grid md:grid-cols-[280px_1fr] gap-6 items-center">
                <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10">
                  {featured.video_url ? (
                    <video
                      src={featured.video_url}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : featured.cover_url ? (
                    <img
                      src={featured.cover_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30">
                      RR
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-5xl font-black mb-3">
                    {featured.artist}
                  </h2>

                  <p className="text-white/60 mb-5">
                    {featured.instagram}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                      <p className="text-white/50 text-sm">Votes</p>
                      <p className="text-[#ffd95a] text-3xl font-black">
                        {featured.votes || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                      <p className="text-white/50 text-sm">Stars</p>
                      <p className="text-[#25c8ff] text-3xl font-black">
                        {featured.stars || 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                      <p className="text-white/50 text-sm">Tips</p>
                      <p className="text-[#ffd95a] text-3xl font-black">
                        ${featured.tips || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => vote(featured)} className="btn">
                      Vote + Star
                    </button>

                    <Link href={`/artists/${featured.id}`} className="ghost">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {artists.map((artist) => {
            const comments = Array.isArray(artist.comments)
              ? artist.comments
              : [];

            return (
              <div key={artist.id} className="card">
                <div className="grid md:grid-cols-[140px_1fr] gap-5">
                  <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10">
                    {artist.video_url ? (
                      <video
                        src={artist.video_url}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : artist.cover_url ? (
                      <img
                        src={artist.cover_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/30">
                        RR
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-3xl font-black">
                      {artist.artist}
                    </h3>

                    <p className="text-white/60 mb-3">
                      {artist.instagram}
                    </p>

                    <p className="text-white/70 mb-4 line-clamp-2">
                      {artist.notes}
                    </p>

                    <div className="flex gap-4 flex-wrap mb-4 text-sm font-bold">
                      <span>🔥 {artist.votes || 0} votes</span>
                      <span>⭐ {artist.stars || 0} stars</span>
                      <span>💬 {comments.length} comments</span>
                    </div>

                    <div className="flex gap-3 flex-wrap mb-4">
                      <button onClick={() => vote(artist)} className="btn">
                        Vote + Star
                      </button>

                      <Link href={`/artists/${artist.id}`} className="ghost">
                        Profile
                      </Link>
                    </div>

                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                      <div className="max-h-28 overflow-y-auto space-y-2 mb-3">
                        {comments.length ? (
                          comments.slice(-3).map((comment: any, i: number) => (
                            <p key={i} className="text-sm text-white/80">
                              <span className="text-[#ffd95a] font-black">
                                {comment.name}:
                              </span>{" "}
                              {comment.text}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-white/40">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          value={commentText[artist.id] || ""}
                          onChange={(e) =>
                            setCommentText({
                              ...commentText,
                              [artist.id]: e.target.value,
                            })
                          }
                          placeholder="Comment..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                        />

                        <button
                          onClick={() => addComment(artist)}
                          className="btn text-sm"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-6">
          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              LEADERBOARD
            </p>

            <h2 className="text-4xl font-black mb-6">
              Top Artists
            </h2>

            <div className="space-y-4">
              {artists.slice(0, 10).map((artist, i) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-4 border-b border-white/10 pb-4"
                >
                  <p className="text-[#ffd95a] font-black text-xl">
                    #{i + 1}
                  </p>

                  {artist.cover_url ? (
                    <img
                      src={artist.cover_url}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-black/40 flex items-center justify-center text-white/30 font-black">
                      RR
                    </div>
                  )}

                  <div>
                    <p className="font-black">
                      {artist.artist}
                    </p>
                    <p className="text-white/60 text-sm">
                      ⭐ {artist.stars || 0} • 🔥 {artist.votes || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              REWARDS
            </p>

            <h2 className="text-3xl font-black mb-4">
              Earn Your Way Up
            </h2>

            <div className="space-y-3 text-white/70">
              <p>⭐ 75 Stars = Radio Spotlight</p>
              <p>⭐ 100 Stars = Free Photo Shoot</p>
              <p>⭐ 150 Stars = Free Studio Hour</p>
              <p>⭐ 500 Stars = Live Interview</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
