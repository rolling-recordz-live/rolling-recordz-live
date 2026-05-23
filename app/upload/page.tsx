"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [submissionUnlocked, setSubmissionUnlocked] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"promo" | "paid">("promo");

  const [coverPreview, setCoverPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  if (
    typeof window !== "undefined" &&
    window.location.search.includes("paid=success") &&
    !submissionUnlocked
  ) {
    setSubmissionUnlocked(true);
  }

  async function validatePromoCode() {
    if (!promoCode.trim()) {
      setMessage("Enter a promo code first.");
      return;
    }

    setLoading(true);
    setMessage("Checking promo code...");

    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("active", true)
      .single();

    setLoading(false);

    if (error || !data) {
      setSubmissionUnlocked(false);
      setMessage("Invalid or expired promo code.");
      return;
    }

    if ((data.uses || 0) >= (data.max_uses || 9999)) {
      setSubmissionUnlocked(false);
      setMessage("This promo code has reached max uses.");
      return;
    }

    setSubmissionUnlocked(true);
    setMessage("Promo code accepted. Free submission unlocked.");
  }

  async function demoPaidUnlock() {
    try {
      setLoading(true);

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: "submission" }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setMessage("Stripe checkout failed.");
    } catch (err) {
      setMessage("Stripe checkout error.");
    }

    setLoading(false);
  }

  async function uploadFile(bucket: string, file: File | null) {
    if (!file || !file.size) return "";

    const maxVideoSize = 50 * 1024 * 1024;

    if (bucket === "artist-videos" && file.size > maxVideoSize) {
      throw new Error(
        "Video is too large. Please upload a compressed clip under 50MB."
      );
    }

    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!submissionUnlocked) {
      setMessage("Unlock submission access first with a promo code or $5 submission.");
      return;
    }

    setLoading(true);
    setMessage("Uploading submission...");

    const form = new FormData(e.target);

    try {
      const songFile = form.get("song") as File;
      const coverFile = form.get("cover") as File;
      const videoFile = form.get("video") as File;

      const songUrl = await uploadFile("artist-songs", songFile);
      const coverUrl = await uploadFile("artist-covers", coverFile);
      const videoUrl = await uploadFile("artist-videos", videoFile);

      const { error } = await supabase.from("artist_uploads").insert({
        artist: form.get("artist"),
        real_name: form.get("realName"),
        instagram: form.get("instagram"),
        email: form.get("email"),
        submission_type: form.get("submissionType"),
        genre: form.get("genre"),
        notes: form.get("notes"),
        song_url: songUrl,
        cover_url: coverUrl,
        video_url: videoUrl,
        status: "pending",
        votes: 0,
        tips: 0,
        stars: 0,
      });

      if (error) throw error;

      if (paymentMode === "promo" && promoCode.trim()) {
        const { data } = await supabase
          .from("promo_codes")
          .select("uses")
          .eq("code", promoCode.trim().toUpperCase())
          .single();

        await supabase
          .from("promo_codes")
          .update({ uses: (data?.uses || 0) + 1 })
          .eq("code", promoCode.trim().toUpperCase());
      }

      e.target.reset();
      setCoverPreview("");
      setVideoPreview("");
      setSubmissionUnlocked(false);
      setPromoCode("");

      setMessage(
        "Confirmed. Your submission was sent for owner approval. If approved, next steps will be sent by email."
      );
    } catch (err: any) {
      setMessage(err.message || "Upload failed.");
    }

    setLoading(false);
  }

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="card">
          <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">
            ARTIST SUBMISSION + ACCOUNT
          </p>

          <h1 className="text-5xl font-black mb-5">
            Upload To Rolling Recordz
          </h1>

          <p className="text-white/70 leading-8 mb-8">
            Submit your music, cover, and optional video. Everything goes to the
            owner dashboard first. Approved records enter Radio, Artists, and
            Community.
          </p>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 mb-5">
            <h2 className="text-2xl font-black mb-4">
              Submission Flow
            </h2>

            <ol className="space-y-3 text-white/70">
              <li>1. Unlock submission with promo code or $5.</li>
              <li>2. Upload your record.</li>
              <li>3. Owner reviews quality.</li>
              <li>4. Approved songs enter radio queue.</li>
              <li>5. Login to track votes, stars, tips, and rewards.</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-[#25c8ff]/20 bg-black/40 p-6 mb-5">
            <h2 className="text-2xl font-black mb-3">
              Artist Account
            </h2>

            <p className="text-white/70 mb-5">
              Use the same email to login and view your artist dashboard.
            </p>

            <div className="flex gap-3 flex-wrap">
              <a href="/login" className="btn inline-block">
                Artist Login
              </a>

              <a href="/dashboard" className="ghost inline-block">
                My Dashboard
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-[#ffd95a]/20 bg-black/40 p-6">
            <h2 className="text-2xl font-black mb-3">
              Motivation Rewards
            </h2>

            <div className="space-y-4 text-white/70">
              <div className="flex justify-between">
                <span>Radio Spotlight</span>
                <span className="text-[#ffd95a] font-black">75 Stars</span>
              </div>
              <div className="flex justify-between">
                <span>Free Photo Shoot</span>
                <span className="text-[#ffd95a] font-black">100 Stars</span>
              </div>
              <div className="flex justify-between">
                <span>Free Studio Hour</span>
                <span className="text-[#ffd95a] font-black">150 Stars</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">
              SUBMISSION ACCESS
            </p>

            <h2 className="text-5xl font-black">
              Unlock Upload
            </h2>
          </div>

          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-black/30 p-5">
            <div className="flex gap-3 flex-wrap mb-5">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode("promo");
                  setSubmissionUnlocked(false);
                }}
                className={paymentMode === "promo" ? "btn" : "ghost"}
              >
                Promo Code
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode("paid");
                  setSubmissionUnlocked(false);
                }}
                className={paymentMode === "paid" ? "btn" : "ghost"}
              >
                $5 Submission
              </button>
            </div>

            {paymentMode === "promo" ? (
              <div className="flex gap-3 flex-wrap">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="ENTER PROMO CODE"
                  className="flex-1 min-w-[220px] bg-black/30 border border-white/10 rounded-xl p-4"
                />

                <button
                  type="button"
                  onClick={validatePromoCode}
                  className="btn"
                >
                  Unlock Free Submission
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-xl font-black mb-2">
                  Fast Lane Submission — $5
                </p>

                <p className="text-white/70 mb-4">
                  Stripe checkout connects next. This button unlocks demo payment for now.
                </p>

                <button
                  type="button"
                  onClick={demoPaidUnlock}
                  className="btn"
                >
                  Continue With $5 Submission
                </button>
              </div>
            )}

            {submissionUnlocked && (
              <p className="text-[#25c8ff] font-black mt-4">
                Submission unlocked.
              </p>
            )}
          </div>

          <input name="artist" required placeholder="Artist Name" className="bg-black/30 border border-white/10 rounded-xl p-4" />
          <input name="realName" placeholder="Real Name" className="bg-black/30 border border-white/10 rounded-xl p-4" />
          <input name="instagram" placeholder="@instagram" className="bg-black/30 border border-white/10 rounded-xl p-4" />
          <input name="email" required type="email" placeholder="Email" className="bg-black/30 border border-white/10 rounded-xl p-4" />

          
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


          <select name="submissionType" className="bg-black/30 border border-white/10 rounded-xl p-4 md:col-span-2">
            <option>Radio Rotation</option>
            <option>Mic Drop Challenge</option>
            <option>Artist Profile</option>
            <option>Video Feature</option>
          </select>

          <div>
            <label className="block mb-2 text-white/60">Upload Song</label>
            <input type="file" name="song" accept="audio/*" className="w-full" />
          </div>

          <div>
            <label className="block mb-2 text-white/60">Upload Cover</label>
            <input
              type="file"
              name="cover"
              accept="image/*"
              className="w-full"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setCoverPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-white/60">
              Upload Music Video / Visual
            </label>

            <input
              type="file"
              name="video"
              accept="video/*"
              className="w-full"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVideoPreview(file ? URL.createObjectURL(file) : "");
              }}
            />
          </div>

          {(coverPreview || videoPreview) && (
            <div className="md:col-span-2 grid md:grid-cols-2 gap-5">
              {coverPreview && (
                <img
                  src={coverPreview}
                  className="rounded-3xl border border-white/10 aspect-square object-cover"
                />
              )}

              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="rounded-3xl border border-white/10 aspect-video object-cover"
                />
              )}
            </div>
          )}

          <textarea
            name="notes"
            placeholder="Tell us about the record..."
            className="md:col-span-2 min-h-[160px] bg-black/30 border border-white/10 rounded-xl p-4"
          />

          <button disabled={loading} className="btn md:col-span-2">
            {loading ? "Uploading..." : "Submit For Approval"}
          </button>

          {message && (
            <div className="md:col-span-2 text-center font-bold text-[#25c8ff]">
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
