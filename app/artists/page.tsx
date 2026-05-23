"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Artist = {
  id: string;
  artist: string;
  instagram: string;
  cover_url: string;
  video_url?: string;
  song_url?: string;
  genre?: string;
  tips_records?: number;
  featured?: boolean;
  notes: string;
  votes: number;
  tips: number;
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);

  async function loadArtists() {
    const { data, error } = await supabase
      .from("artist_uploads")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setArtists(data || []);
  }

  async function vote(
    e: React.MouseEvent,
    id: string,
    currentVotes: number
  ) {
    e.preventDefault();

    const { error } = await supabase
      .from("artist_uploads")
      .update({ votes: currentVotes + 1 })
      .eq("id", id);

    if (!error) loadArtists();
  }

  useEffect(() => {
    loadArtists();

    const channel = supabase
      .channel("artists-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "artist_uploads" },
        () => loadArtists()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="mb-10">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          SUPPORT THE UNDERGROUND
        </p>

        <h1 className="text-6xl md:text-8xl font-black">
          Artists
        </h1>

        <p className="text-white/60 mt-4 max-w-2xl">
          Click an artist card to open their Rolling Recordz profile.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Link
            href={`/artists/${artist.id}`}
            key={artist.id}
            className="card hover:scale-[1.02] transition cursor-pointer block"
          >
            <div className="aspect-square rounded-2xl overflow-hidden mb-5 bg-black/30 border border-white/10">
              {artist.video_url ? (
                <video
                  src={artist.video_url}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : artist.cover_url ? (
                <img
                  src={artist.cover_url}
                  alt={artist.artist}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30">
                  RR
                </div>
              )}
            </div>

            <p className="text-[#ffd95a] text-xs tracking-[.3em] font-black mb-2">
              ROLLING RECORDZ ARTIST
            </p>

            <h2 className="text-3xl font-black mb-2">
              {artist.artist}
            </h2>

            <p className="text-white/60 mb-4">
              {artist.instagram}
            </p>

            <p className="text-white/70 mb-5 line-clamp-3">
              {artist.notes}
            </p>

            {artist.song_url && (
              <audio
                controls
                className="w-full mb-5"
                src={artist.song_url}
                onClick={(e) => e.preventDefault()}
              />
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={(e) => vote(e, artist.id, artist.votes || 0)}
                className="btn"
              >
                Vote ⭐ {artist.votes || 0}
              </button>

              <span className="ghost">
                View Profile
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
