import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const { data: uploads } = await supabase
    .from("artist_uploads")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const artists = uploads || [];
  const nowPlaying = artists.find((a) => a.song_url) || artists[0];
  const newestArtist = artists[0];
  const videoWinner =
    artists.find((a) => a.video_of_week) ||
    artists.filter((a) => a.video_url).sort((a, b) => (b.video_votes || 0) - (a.video_votes || 0))[0];

  const artistCount = new Set(artists.map((a) => a.email || a.artist)).size;
  const songCount = artists.filter((a) => a.song_url).length;
  const videoCount = artists.filter((a) => a.video_url).length;

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="min-h-[70vh] flex flex-col justify-center">
        <p className="text-[#ffd95a] tracking-[.35em] text-sm font-black mb-4">
          LATE NIGHT FREQUENCIES
        </p>

        <h1 className="text-6xl md:text-9xl font-black leading-[.85] tracking-[-.07em] max-w-6xl">
          ENTER THE FREQUENCIES
        </h1>

        <p className="text-white/70 max-w-3xl text-xl mt-6 leading-8">
          Rolling Recordz is a live underground music ecosystem for independent artists,
          record players, broadcasts, visuals, and community-driven discovery.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link href="/upload" className="btn">Upload Music</Link>
          <Link href="/radio" className="ghost">Enter Radio</Link>
          <Link href="/video-of-the-week" className="ghost">Video Of The Week</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-10">
        <div className="card">
          <p className="text-white/50">Artists Joined</p>
          <h2 className="text-5xl font-black text-[#ffd95a]">{artistCount}</h2>
        </div>

        <div className="card">
          <p className="text-white/50">Songs Uploaded</p>
          <h2 className="text-5xl font-black text-[#25c8ff]">{songCount}</h2>
        </div>

        <div className="card">
          <p className="text-white/50">Videos Submitted</p>
          <h2 className="text-5xl font-black text-[#ffd95a]">{videoCount}</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
            NOW PLAYING
          </p>

          <div className="aspect-square rounded-3xl bg-black/40 overflow-hidden mb-5">
            {nowPlaying?.video_url ? (
              <video src={nowPlaying.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
            ) : nowPlaying?.cover_url ? (
              <img src={nowPlaying.cover_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-5xl font-black">RR</div>
            )}
          </div>

          <h2 className="text-3xl font-black">{nowPlaying?.artist || "No Artist Yet"}</h2>
          <p className="text-white/60 mt-2">{nowPlaying?.genre || "Live Radio Rotation"}</p>
          <Link href="/radio" className="btn inline-block mt-5">Listen Now</Link>
        </div>

        <div className="card">
          <p className="text-[#25c8ff] tracking-[.25em] text-xs font-black mb-3">
            NEWEST ARTIST
          </p>

          <div className="aspect-square rounded-3xl bg-black/40 overflow-hidden mb-5">
            {newestArtist?.cover_url ? (
              <img src={newestArtist.cover_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-5xl font-black">RR</div>
            )}
          </div>

          <h2 className="text-3xl font-black">{newestArtist?.artist || "Waiting For Uploads"}</h2>
          <p className="text-white/60 mt-2">{newestArtist?.instagram || "Artist uploads appear here"}</p>
          <Link href="/artists" className="ghost inline-block mt-5">View Artists</Link>
        </div>

        <div className="card border-[#ffd95a]/30">
          <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
            CURRENT CHAMPION
          </p>

          <div className="aspect-square rounded-3xl bg-black/40 overflow-hidden mb-5">
            {videoWinner?.video_url ? (
              <video src={videoWinner.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" />
            ) : videoWinner?.cover_url ? (
              <img src={videoWinner.cover_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-5xl font-black">RR</div>
            )}
          </div>

          <h2 className="text-3xl font-black">{videoWinner?.artist || "No Video Yet"}</h2>
          <p className="text-white/60 mt-2">⭐ {videoWinner?.video_votes || 0} video votes</p>
          <Link href="/video-of-the-week" className="btn inline-block mt-5">Watch Videos</Link>
        </div>
      </div>
    </section>
  );
}
