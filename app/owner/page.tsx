"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SERVICES } from "@/lib/services";

type Tab =
  | "overview"
  | "uploads"
  | "approved"
  | "artists"
  | "bookings"
  | "gallery"
  | "serviceImages"
  | "radioWorld"
  | "payments"
  | "moderation";

export default function OwnerPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [uploads, setUploads] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [serviceAssets, setServiceAssets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState("");
  const [status, setStatus] = useState("");

  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const [serviceSlug, setServiceSlug] = useState(SERVICES[0]?.slug || "");
  const [serviceImage, setServiceImage] = useState<File | null>(null);

  const [radioWorldFile, setRadioWorldFile] = useState<File | null>(null);
  const [radioWorldGenre, setRadioWorldGenre] = useState("All");

  function genreKey(value: string) {
    return value
      .toLowerCase()
      .replace("&", "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  async function loadAll() {
    setStatus("Loading dashboard...");

    const [
      pending,
      live,
      bookings,
      galleryItems,
      paymentItems,
      serviceAssetRows,
      settingRows,
    ] = await Promise.all([
      supabase.from("artist_uploads").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("artist_uploads").select("*").eq("status", "approved").order("created_at", { ascending: false }),
      supabase.from("service_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("gallery_items").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("service_assets").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
    ]);

    setUploads(pending.data || []);
    setApproved(live.data || []);
    setRequests(bookings.data || []);
    setGallery(galleryItems.data || []);
    setPayments(paymentItems.data || []);
    setServiceAssets(serviceAssetRows.data || []);
    setSettings(settingRows.data || []);
    setStatus("");
  }

  async function uploadToBucket(bucket: string, file: File) {
    const filePath = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  }

  async function approve(id: string) {
    setLoading(id);
    const { error } = await supabase.from("artist_uploads").update({ status: "approved" }).eq("id", id);
    setLoading("");
    if (error) return setStatus(error.message);
    setStatus("Artist approved to radio.");
    loadAll();
  }

  async function reject(id: string) {
    setLoading(id);
    const { error } = await supabase.from("artist_uploads").update({ status: "rejected" }).eq("id", id);
    setLoading("");
    if (error) return setStatus(error.message);
    setStatus("Artist rejected.");
    loadAll();
  }

  async function featureArtist(id: string) {
    await supabase.from("artist_uploads").update({ featured: false }).eq("status", "approved");
    const { error } = await supabase.from("artist_uploads").update({ featured: true }).eq("id", id);
    if (error) return setStatus(error.message);
    setStatus("Featured artist updated.");
    loadAll();
  }

  async function removeApproved(id: string) {
    if (!confirm("Remove this artist from approved queue?")) return;
    const { error } = await supabase.from("artist_uploads").update({ status: "rejected" }).eq("id", id);
    if (error) return setStatus(error.message);
    setStatus("Removed from approved queue.");
    loadAll();
  }

  async function uploadGallery() {
    if (!galleryFile) return setStatus("Choose a gallery file first.");
    setLoading("gallery");

    try {
      const fileUrl = await uploadToBucket("gallery", galleryFile);
      const { error } = await supabase.from("gallery_items").insert({
        title: galleryTitle,
        file_url: fileUrl,
        file_type: galleryFile.type,
        likes: 0,
        comments: [],
      });

      if (error) throw error;

      setGalleryTitle("");
      setGalleryFile(null);
      setStatus("Gallery item uploaded.");
      loadAll();
    } catch (err: any) {
      setStatus(err.message || "Gallery upload failed.");
    }

    setLoading("");
  }

  async function deleteGalleryItem(id: string) {
    if (!confirm("Delete this gallery item from the feed?")) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) return setStatus(error.message);
    setStatus("Gallery item deleted.");
    loadAll();
  }

  async function uploadServiceImage() {
    if (!serviceImage) return setStatus("Choose a service image first.");

    setLoading("serviceImage");

    try {
      const imageUrl = await uploadToBucket("service-images", serviceImage);
      const service = SERVICES.find((s) => s.slug === serviceSlug);

      const { error } = await supabase.from("service_assets").upsert({
        service_slug: serviceSlug,
        title: service?.title || serviceSlug,
        image_url: imageUrl,
      });

      if (error) throw error;

      setServiceImage(null);
      setStatus("Service image updated.");
      loadAll();
    } catch (err: any) {
      setStatus(err.message || "Service image upload failed.");
    }

    setLoading("");
  }

  async function uploadRadioWorld() {
    if (!radioWorldFile) return setStatus("Choose a video or image first.");

    if (radioWorldFile.size > 100 * 1024 * 1024) {
      return setStatus("Radio World file too big. Keep it under 100MB for now.");
    }

    setLoading("radioWorld");
    setStatus("Uploading Radio World...");

    try {
      const url = await uploadToBucket("site-assets", radioWorldFile);

      const settingKey =
        radioWorldGenre === "All"
          ? "radio_world_url"
          : `radio_world_url_${genreKey(radioWorldGenre)}`;

      const { error } = await supabase.from("site_settings").upsert({
        key: settingKey,
        value: url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setRadioWorldFile(null);
      setStatus(`Radio World updated for ${radioWorldGenre}.`);
      await loadAll();
    } catch (err: any) {
      setStatus(err.message || "Radio world upload failed.");
    }

    setLoading("");
  }

  useEffect(() => {
    loadAll();

    const channel = supabase
      .channel("owner-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "artist_uploads" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_items" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "service_assets" }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => loadAll())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const artistStats = useMemo(() => {
    const all = [...uploads, ...approved];
    return all.map((a) => {
      const records = a.tips_records || 0;
      const earnings = records * 0.25 * 0.98;
      const totalStars = (a.stars || 0) + (a.votes || 0);
      return { ...a, earnings, totalStars };
    });
  }, [uploads, approved]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "uploads", label: `Uploads (${uploads.length})` },
    { id: "approved", label: `Queue (${approved.length})` },
    { id: "artists", label: `Artists (${artistStats.length})` },
    { id: "bookings", label: `Bookings (${requests.length})` },
    { id: "gallery", label: `Gallery (${gallery.length})` },
    { id: "serviceImages", label: "Service Images" },
    { id: "radioWorld", label: "Radio World" },
    { id: "payments", label: `Payments (${payments.length})` },
    { id: "moderation", label: "Moderation" },
  ];

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="mb-8">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          PRIVATE CONTROL CENTER
        </p>

        <h1 className="text-5xl md:text-8xl font-black">Owner Dashboard</h1>

        <button onClick={loadAll} className="btn mt-6">
          Refresh Dashboard
        </button>

        {status && <p className="mt-4 text-[#25c8ff] font-bold">{status}</p>}
      </div>

      <div className="flex gap-3 flex-wrap mb-8">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={tab === item.id ? "btn" : "ghost"}>
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="card"><p className="text-white/50">Pending Uploads</p><h2 className="text-5xl font-black text-[#ffd95a]">{uploads.length}</h2></div>
          <div className="card"><p className="text-white/50">Approved Queue</p><h2 className="text-5xl font-black text-[#25c8ff]">{approved.length}</h2></div>
          <div className="card"><p className="text-white/50">Artists</p><h2 className="text-5xl font-black text-[#ffd95a]">{artistStats.length}</h2></div>
          <div className="card"><p className="text-white/50">Bookings</p><h2 className="text-5xl font-black text-[#25c8ff]">{requests.length}</h2></div>
          <div className="card"><p className="text-white/50">Payments</p><h2 className="text-5xl font-black text-[#ffd95a]">{payments.length}</h2></div>
        </div>
      )}

      {tab === "uploads" && (
        <div className="grid gap-6">
          {uploads.length ? uploads.map((u) => (
            <div key={u.id} className="card">
              <div className="grid lg:grid-cols-[220px_1fr] gap-6">
                <div className="space-y-4">
                  {u.video_url ? <video src={u.video_url} controls className="rounded-3xl w-full aspect-video object-cover bg-black/40" /> :
                   u.cover_url ? <img src={u.cover_url} className="rounded-3xl aspect-square object-cover bg-black/40" /> :
                   <div className="rounded-3xl aspect-square bg-black/40 flex items-center justify-center text-white/30 font-black text-4xl">RR</div>}
                </div>

                <div>
                  <h2 className="text-4xl font-black">{u.artist}</h2>
                  <p className="text-white/60 mb-3">{u.instagram} • {u.email}</p>
                  <p className="text-white/70 mb-5">{u.notes}</p>
                  {u.song_url && <audio controls src={u.song_url} className="w-full mb-5" />}
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => approve(u.id)} disabled={loading === u.id} className="btn">
                      {loading === u.id ? "Approving..." : "Approve To Radio"}
                    </button>
                    <button onClick={() => reject(u.id)} disabled={loading === u.id} className="ghost">Reject</button>
                  </div>
                </div>
              </div>
            </div>
          )) : <div className="card text-white/60">No pending artist uploads.</div>}
        </div>
      )}

      {tab === "approved" && (
        <div className="grid md:grid-cols-3 gap-6">
          {approved.length ? approved.map((a) => (
            <div key={a.id} className="card">
              {a.video_url ? <video src={a.video_url} muted loop autoPlay playsInline className="rounded-3xl aspect-square object-cover mb-4 bg-black/40" /> :
               a.cover_url ? <img src={a.cover_url} className="rounded-3xl aspect-square object-cover mb-4 bg-black/40" /> :
               <div className="rounded-3xl aspect-square mb-4 bg-black/40 border border-white/10 flex items-center justify-center text-white/30 text-4xl font-black">RR</div>}
              <h2 className="text-2xl font-black">{a.artist}</h2>
              <p className="text-white/60 mb-4">{a.instagram}</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => featureArtist(a.id)} className="btn">Feature Artist</button>
                <button onClick={() => removeApproved(a.id)} className="ghost">Remove From Queue</button>
              </div>
            </div>
          )) : <div className="card text-white/60">No approved artists yet.</div>}
        </div>
      )}

      {tab === "artists" && (
        <div className="grid gap-6">
          {artistStats.length ? artistStats.map((a) => (
            <div key={a.id} className="card">
              <div className="grid lg:grid-cols-[160px_1fr] gap-5">
                <div className="aspect-square rounded-3xl overflow-hidden bg-black/40 border border-white/10">
                  {a.video_url ? <video src={a.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover" /> :
                   a.cover_url ? <img src={a.cover_url} className="w-full h-full object-cover" /> :
                   <div className="w-full h-full flex items-center justify-center text-white/30 font-black text-3xl">RR</div>}
                </div>

                <div>
                  <h2 className="text-3xl font-black">{a.artist}</h2>
                  <p className="text-white/60">{a.real_name || "No real name"} • {a.email}</p>
                  <p className="text-white/60 mb-4">{a.instagram || "No Instagram"} • Status: {a.status}</p>

                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4"><p className="text-white/50">Stars</p><p className="text-[#ffd95a] text-3xl font-black">{a.totalStars}</p></div>
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4"><p className="text-white/50">Votes</p><p className="text-[#25c8ff] text-3xl font-black">{a.votes || 0}</p></div>
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4"><p className="text-white/50">Records Tipped</p><p className="text-[#ffd95a] text-3xl font-black">{a.tips_records || 0}</p></div>
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-4"><p className="text-white/50">Artist Earnings</p><p className="text-[#25c8ff] text-3xl font-black">${a.earnings.toFixed(2)}</p></div>
                  </div>

                  <div className="mt-4 text-white/70">
                    Progress: Radio Spotlight {Math.min(100, Math.round((a.totalStars / 75) * 100))}% • Photo Shoot {Math.min(100, Math.round((a.totalStars / 100) * 100))}% • Studio Hour {Math.min(100, Math.round((a.totalStars / 150) * 100))}%
                  </div>
                </div>
              </div>
            </div>
          )) : <div className="card text-white/60">No artist data yet.</div>}
        </div>
      )}

      {tab === "bookings" && (
        <div className="grid gap-6">
          {requests.length ? requests.map((r) => (
            <div key={r.id} className="card">
              <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-2">BOOKING REQUEST</p>
              <h2 className="text-4xl font-black">{r.service}</h2>
              <p className="text-white/60 mb-2">{r.name} • {r.email}</p>
              <p className="text-[#25c8ff] font-bold mb-4">Budget: {r.budget}</p>
              <p className="text-white/80 leading-7">{r.details}</p>
            </div>
          )) : <div className="card text-white/60">No booking requests yet.</div>}
        </div>
      )}

      {tab === "gallery" && (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="card">
            <h2 className="text-4xl font-black mb-6">Upload Gallery Post</h2>
            <div className="grid gap-5">
              <input value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="Gallery title" className="bg-black/30 border border-white/10 rounded-xl p-4" />
              <input type="file" accept="image/*,video/*" onChange={(e) => setGalleryFile(e.target.files?.[0] || null)} className="bg-black/30 border border-white/10 rounded-xl p-4" />
              <button onClick={uploadGallery} disabled={loading === "gallery"} className="btn">{loading === "gallery" ? "Uploading..." : "Upload To Gallery Feed"}</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {gallery.map((g) => (
              <div key={g.id} className="card">
                <div className="aspect-video rounded-3xl overflow-hidden bg-black/40 mb-4">
                  {g.file_type?.startsWith("video") ? <video src={g.file_url} controls className="w-full h-full object-cover" /> : <img src={g.file_url} className="w-full h-full object-cover" />}
                </div>
                <h3 className="text-2xl font-black">{g.title || "Gallery Post"}</h3>
                <p className="text-white/50 mb-4">🔥 {g.likes || 0} • 💬 {Array.isArray(g.comments) ? g.comments.length : 0}</p>
                <button onClick={() => deleteGalleryItem(g.id)} className="ghost">Delete Post</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "serviceImages" && (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="card">
            <h2 className="text-4xl font-black mb-6">Service Images</h2>
            <div className="grid gap-5">
              <select value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)} className="bg-black/30 border border-white/10 rounded-xl p-4">
                {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setServiceImage(e.target.files?.[0] || null)} className="bg-black/30 border border-white/10 rounded-xl p-4" />
              <button onClick={uploadServiceImage} disabled={loading === "serviceImage"} className="btn">
                {loading === "serviceImage" ? "Uploading..." : "Upload Service Image"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((s) => {
              const asset = serviceAssets.find((a) => a.service_slug === s.slug);
              return (
                <div key={s.slug} className="card">
                  <div className="aspect-video rounded-3xl overflow-hidden bg-black/40 mb-4 border border-white/10">
                    {asset?.image_url ? <img src={asset.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/30">No image yet</div>}
                  </div>
                  <h3 className="text-2xl font-black">{s.title}</h3>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "radioWorld" && (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <div className="card">
            <h2 className="text-4xl font-black mb-6">Radio Background / World</h2>
            <p className="text-white/60 mb-5">Upload a video loop or image for the Radio page background.</p>
            <select
              value={radioWorldGenre}
              onChange={(e) => setRadioWorldGenre(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-xl p-4 w-full mb-5"
            >
              <option>All</option>
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

            <input type="file" accept="image/*,video/*" onChange={(e) => setRadioWorldFile(e.target.files?.[0] || null)} className="bg-black/30 border border-white/10 rounded-xl p-4 w-full mb-5" />
            <button onClick={uploadRadioWorld} disabled={loading === "radioWorld"} className="btn">
              {loading === "radioWorld" ? "Uploading..." : "Update Radio World"}
            </button>
          </div>

          <div className="card">
            <h2 className="text-3xl font-black mb-4">Current Radio World</h2>
            <p className="text-white/60 break-all">
              {settings.find((s) => s.key === "radio_world_url")?.value || "No custom world uploaded yet."}
            </p>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="grid gap-6">
          {payments.length ? payments.map((payment) => (
            <div key={payment.id} className="card">
              <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-2">PAYMENT RECEIVED</p>
              <h2 className="text-4xl font-black">{payment.item}</h2>
              <p className="text-white/60 mb-2">{payment.customer_email || "No email captured"}</p>
              <p className="text-[#25c8ff] text-3xl font-black mb-3">${((payment.amount_total || 0) / 100).toFixed(2)}</p>
              <p className="text-white/70">Status: {payment.payment_status} • {payment.currency?.toUpperCase()}</p>
            </div>
          )) : <div className="card text-white/60">No payments tracked yet.</div>}
        </div>
      )}

      {tab === "moderation" && (
        <div className="grid gap-6">
          <div className="card">
            <h2 className="text-4xl font-black mb-4">Comment Moderation</h2>
            <p className="text-white/70">Delete comments, block words, and hide posts will go here.</p>
          </div>
        </div>
      )}
    </section>
  );
}
