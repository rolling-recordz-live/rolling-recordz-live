"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const REWARDS = [
  ["Radio Spotlight", 75, "Unlock spotlight radio placement."],
  ["Free Photo Shoot", 100, "Unlock a free photo shoot."],
  ["Free Studio Hour", 150, "Unlock one free studio hour."],
];

export default function ArtistDashboard() {
  const [user, setUser] = useState<any>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [tab, setTab] = useState("overview");
  const [message, setMessage] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    const { data } = await supabase.auth.getUser();
    const currentUser = data.user;
    setUser(currentUser);

    if (!currentUser?.email) return;

    const artistRows = await supabase
      .from("artist_uploads")
      .select("*")
      .eq("email", currentUser.email)
      .order("created_at", { ascending: false });

    setUploads(artistRows.data || []);
  }

  async function unlockPromo() {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("active", true)
      .single();

    if (error || !data) return setMessage("Invalid promo code.");
    if ((data.uses || 0) >= (data.max_uses || 9999)) return setMessage("Code maxed out.");

    setUnlocked(true);
    setMessage("Upload unlocked.");
  }

  async function payToUnlock() {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: "submission" }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function uploadFile(bucket: string, file: File | null) {
    if (!file || !file.size) return "";
    if (bucket === "artist-videos" && file.size > 50 * 1024 * 1024) {
      throw new Error("Video must be under 50MB.");
    }

    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;

    return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  }

  async function submitUpload(e: any) {
    e.preventDefault();

    if (!unlocked) return setMessage("Unlock upload first with promo code or $5.");
    if (!user?.email) return setMessage("Login required.");

    setLoading(true);
    setMessage("Uploading...");

    const form = new FormData(e.target);

    try {
      const songUrl = await uploadFile("artist-songs", form.get("song") as File);
      const coverUrl = await uploadFile("artist-covers", form.get("cover") as File);
      const videoUrl = await uploadFile("artist-videos", form.get("video") as File);

      const { error } = await supabase.from("artist_uploads").insert({
        artist: form.get("artist"),
        real_name: form.get("realName"),
        instagram: form.get("instagram"),
        email: user.email,
        submission_type: form.get("submissionType"),
        genre: form.get("genre"),
        notes: form.get("notes"),
        song_url: songUrl,
        cover_url: coverUrl,
        video_url: videoUrl,
        status: "pending",
        votes: 0,
        stars: 0,
        tips_records: 0,
      });

      if (error) throw error;

      e.target.reset();
      setUnlocked(false);
      setPromoCode("");
      setMessage("Submitted for owner approval.");
      loadDashboard();
    } catch (err: any) {
      setMessage(err.message || "Upload failed.");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalVotes = useMemo(() => uploads.reduce((s, u) => s + (u.votes || 0), 0), [uploads]);
  const totalStars = useMemo(() => uploads.reduce((s, u) => s + (u.stars || 0) + (u.votes || 0), 0), [uploads]);
  const totalTipRecords = useMemo(() => uploads.reduce((s, u) => s + (u.tips_records || 0), 0), [uploads]);
  const privateEarnings = totalTipRecords * 0.25 * 0.98;

  if (!user?.email) {
    return (
      <section className="px-6 md:px-20 py-10">
        <div className="card max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-4">Artist Dashboard</h1>
          <p className="text-white/70 mb-6">Please log in to view your dashboard.</p>
          <a href="/login" className="btn">Artist Login</a>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 md:px-20 py-10">
      <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
        ARTIST CONTROL ROOM
      </p>

      <h1 className="text-6xl md:text-8xl font-black mb-3">Dashboard</h1>

      <p className="text-white/60 mb-8">Logged in as {user.email}</p>

      <div className="flex gap-3 flex-wrap mb-8">
        {["overview", "uploads", "upload", "rewards"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "btn" : "ghost"}>
            {t === "upload" ? "Upload Music" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {message && <p className="text-[#25c8ff] font-bold mb-6">{message}</p>}

      {tab === "overview" && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card"><p className="text-white/50">Total Stars</p><h2 className="text-5xl font-black text-[#ffd95a]">{totalStars}</h2></div>
          <div className="card"><p className="text-white/50">Votes</p><h2 className="text-5xl font-black text-[#25c8ff]">{totalVotes}</h2></div>
          <div className="card"><p className="text-white/50">Private Earnings</p><h2 className="text-5xl font-black text-[#ffd95a]">${privateEarnings.toFixed(2)}</h2></div>
          <div className="card"><p className="text-white/50">Uploads</p><h2 className="text-5xl font-black text-[#25c8ff]">{uploads.length}</h2></div>
        </div>
      )}

      {tab === "uploads" && (
        <div className="grid gap-6">
          {uploads.length ? uploads.map((u) => (
            <div key={u.id} className="card grid md:grid-cols-[160px_1fr] gap-5">
              <div className="aspect-square rounded-3xl overflow-hidden bg-black/40">
                {u.video_url ? <video src={u.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" /> :
                 u.cover_url ? <img src={u.cover_url} className="w-full h-full object-cover" /> :
                 <div className="w-full h-full flex items-center justify-center text-white/30 font-black text-3xl">RR</div>}
              </div>

              <div>
                <h2 className="text-3xl font-black">{u.artist}</h2>
                <p className="text-white/60 mb-3">Status: <span className="text-[#25c8ff] font-black">{u.status}</span></p>
                <p className="text-white/70">⭐ {(u.stars || 0) + (u.votes || 0)} stars • 🔥 {u.votes || 0} votes • {u.tips_records || 0} Records tipped</p>
                {u.song_url && <audio controls src={u.song_url} className="w-full mt-4" />}
              </div>
            </div>
          )) : <div className="card text-white/60">No uploads yet.</div>}
        </div>
      )}

      {tab === "upload" && (
        <form onSubmit={submitUpload} className="card grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">NEW SUBMISSION</p>
            <h2 className="text-5xl font-black">Upload Music</h2>
          </div>

          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-black/30 p-5">
            <div className="flex gap-3 flex-wrap">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="PROMO CODE" className="flex-1 min-w-[220px] bg-black/30 border border-white/10 rounded-xl p-4" />
              <button type="button" onClick={unlockPromo} className="btn">Use Code</button>
              <button type="button" onClick={payToUnlock} className="ghost">$5 Submission</button>
            </div>
            {unlocked && <p className="text-[#25c8ff] font-black mt-4">Upload unlocked.</p>}
          </div>

          <input name="artist" required placeholder="Artist Name" className="bg-black/30 border border-white/10 rounded-xl p-4" />
          <input name="realName" placeholder="Real Name" className="bg-black/30 border border-white/10 rounded-xl p-4" />
          <input name="instagram" placeholder="@instagram" className="bg-black/30 border border-white/10 rounded-xl p-4" />

          
          <select name="genre" className="bg-black/30 border border-white/10 rounded-xl p-4">
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


          <select name="submissionType" className="bg-black/30 border border-white/10 rounded-xl p-4">
            <option>Radio Rotation</option>
            <option>Mic Drop Challenge</option>
            <option>Artist Profile</option>
            <option>Video Feature</option>
          </select>

          <div><label className="block mb-2 text-white/60">Song</label><input type="file" name="song" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/mp4" /></div>
          <div><label className="block mb-2 text-white/60">Cover</label><input type="file" name="cover" accept="image/*" /></div>
          <div className="md:col-span-2"><label className="block mb-2 text-white/60">Video / Visual</label><input type="file" name="video" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/m4a,audio/mp4,video/*" /></div>

          <textarea name="notes" placeholder="Tell us about the record..." className="md:col-span-2 min-h-[150px] bg-black/30 border border-white/10 rounded-xl p-4" />

          <button disabled={loading} className="btn md:col-span-2">
            {loading ? "Uploading..." : "Submit For Approval"}
          </button>
        </form>
      )}

      {tab === "rewards" && (
        <div className="grid md:grid-cols-3 gap-6">
          {REWARDS.map(([title, goal, desc]: any) => {
            const progress = Math.min(100, Math.round((totalStars / goal) * 100));
            return (
              <div key={title} className="card">
                <h2 className="text-3xl font-black mb-2">{title}</h2>
                <p className="text-white/60 mb-4">{desc}</p>
                <p className="text-[#ffd95a] font-black mb-2">{totalStars}/{goal}</p>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#25c8ff] to-[#ffd95a]" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white/50 text-sm mt-2">{progress}% complete</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
