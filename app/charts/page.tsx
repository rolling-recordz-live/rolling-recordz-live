import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function ChartsPage() {
  const { data } = await supabase
    .from("artist_uploads")
    .select("*")
    .eq("status", "approved");

  const uploads = data || [];

  const radioChart = uploads
    .filter((x) => x.song_url)
    .sort((a, b) => ((b.votes || 0) + (b.stars || 0)) - ((a.votes || 0) + (a.stars || 0)))
    .slice(0, 10);

  const videoChart = uploads
    .filter((x) => x.video_url)
    .sort((a, b) => (b.video_votes || 0) - (a.video_votes || 0))
    .slice(0, 10);

  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-3">
        ROLLING RECORDZ RANKINGS
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-10">
        Top Charts
      </h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-4xl font-black mb-6 text-[#ffd95a]">
            Top 10 Radio
          </h2>

          <div className="space-y-4">
            {radioChart.length ? radioChart.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 border-b border-white/10 pb-4">
                <p className="text-3xl font-black text-[#25c8ff] w-10">
                  {index + 1}
                </p>

                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0">
                  {track.cover_url ? (
                    <img src={track.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-black">RR</div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-black truncate">{track.artist}</h3>
                  <p className="text-white/60 text-sm">{track.genre || "Radio Rotation"}</p>
                  <p className="text-[#ffd95a] text-sm">
                    <img src="/icons/star.PNG" alt="Star" className="inline-block w-5 h-5 object-contain align-middle" /> {(track.stars || 0) + (track.votes || 0)}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-white/60">No radio tracks yet.</p>
            )}
          </div>

          <Link href="/radio" className="btn inline-block mt-6">
            Listen To Radio
          </Link>
        </div>

        <div className="card">
          <h2 className="text-4xl font-black mb-6 text-[#25c8ff]">
            Top 10 Videos
          </h2>

          <div className="space-y-4">
            {videoChart.length ? videoChart.map((video, index) => (
              <div key={video.id} className="flex items-center gap-4 border-b border-white/10 pb-4">
                <p className="text-3xl font-black text-[#ffd95a] w-10">
                  {index + 1}
                </p>

                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 shrink-0">
                  {video.video_url ? (
                    <video src={video.video_url} muted playsInline className="w-full h-full object-cover" />
                  ) : video.cover_url ? (
                    <img src={video.cover_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-black">RR</div>
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-black truncate">{video.artist}</h3>
                  <p className="text-white/60 text-sm">{video.genre || "Music Video"}</p>
                  <p className="text-[#ffd95a] text-sm">
                    <img src="/icons/star.PNG" alt="Star" className="inline-block w-5 h-5 object-contain align-middle" /> {video.video_votes || 0}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-white/60">No videos yet.</p>
            )}
          </div>

          <Link href="/video-of-the-week" className="btn inline-block mt-6">
            Watch Videos
          </Link>
        </div>
      </div>
    </section>
  );
}
