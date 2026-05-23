import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TipArtistButton from "@/components/TipArtistButton";

export default async function ArtistProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: artist } = await supabase
    .from("artist_uploads")
    .select("*")
    .eq("id", id)
    .single();

  if (!artist) {
    return <section className="p-10 text-white">Artist not found.</section>;
  }

  return (
    <section className="min-h-screen">
      <div className="relative h-[52vh] overflow-hidden border-b border-white/10">
        {artist.video_url ? (
          <video
            src={artist.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
        ) : artist.cover_url ? (
          <img
            src={artist.cover_url}
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />

        <div className="relative z-10 h-full flex items-end px-6 md:px-20 pb-10">
          <div>
            <p className="text-[#ffd95a] tracking-[.35em] text-xs font-black mb-3">
              ROLLING RECORDZ ARTIST PROFILE
            </p>

            <h1 className="text-7xl md:text-9xl font-black leading-[.85] tracking-[-.06em]">
              {artist.artist}
            </h1>

            <p className="mt-4 text-xl text-white/70">
              {artist.instagram || "Independent Artist"}
            </p>

            <div className="mt-6 flex gap-3 flex-wrap">
              <Link href="/radio" className="btn">
                Hear On Radio
              </Link>

              <Link href="/artists" className="ghost">
                Back To Artists
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-20 py-10 grid lg:grid-cols-[380px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="card">
            <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10 mb-5">
              {artist.video_url ? (
                <video
                  src={artist.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : artist.cover_url ? (
                <img
                  src={artist.cover_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30">
                  RR
                </div>
              )}
            </div>

            <h2 className="text-3xl font-black mb-4">
              Artist Stats
            </h2>

            <div className="space-y-3 text-white/70">
              <div className="flex justify-between">
                <span>Votes</span>
                <span className="font-black text-[#ffd95a]">
                  {artist.votes || 0}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Community Support</span>
                <span className="font-black text-[#25c8ff]">
                  {artist.tips_records || 0} Records
                </span>
              </div>

              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-black text-[#25c8ff]">
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              ABOUT THE ARTIST / SUBMISSION
            </p>

            <p className="text-xl leading-9 text-white/80">
              {artist.notes || "No bio or notes submitted yet."}
            </p>
          </div>

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              FEATURED RECORD
            </p>

            <h2 className="text-5xl font-black mb-6">
              Latest Release
            </h2>

            {artist.song_url ? (
              <audio
                controls
                src={artist.song_url}
                className="w-full"
              />
            ) : (
              <p className="text-white/60">
                No audio file uploaded for this artist.
              </p>
            )}
          </div>

          {artist.video_url && (
            <div className="card">
              <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
                VIDEO / VISUAL
              </p>

              <video
                src={artist.video_url}
                controls
                loop
                playsInline
                className="w-full rounded-3xl border border-white/10"
              />
            </div>
          )}

          <TipArtistButton artist={artist} />

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              CONNECT
            </p>

            <div className="flex gap-3 flex-wrap">
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram.replace("@", "")}`}
                  target="_blank"
                  className="btn"
                >
                  Instagram
                </a>
              )}

              <Link href="/community" className="ghost">
                View Community
              </Link>

              <Link href="/radio" className="ghost">
                Radio Station
              </Link>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
