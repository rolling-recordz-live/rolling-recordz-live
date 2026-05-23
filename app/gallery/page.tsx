"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [openComments, setOpenComments] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  async function loadGallery() {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return setStatus(error.message);
    setItems(data || []);
  }

  async function likePost(item: any) {
    const likes = (item.likes || 0) + 1;
    setItems((cur) => cur.map((x) => (x.id === item.id ? { ...x, likes } : x)));
    await supabase.from("gallery_items").update({ likes }).eq("id", item.id);
  }

  async function addComment(item: any) {
    const text = commentText[item.id]?.trim();
    if (!text) return;

    const comments = Array.isArray(item.comments) ? item.comments : [];
    const next = [...comments, { name: "Listener", text, date: new Date().toISOString() }];

    setItems((cur) => cur.map((x) => (x.id === item.id ? { ...x, comments: next } : x)));
    setCommentText((cur) => ({ ...cur, [item.id]: "" }));

    await supabase.from("gallery_items").update({ comments: next }).eq("id", item.id);
  }

  async function sharePost(item: any) {
    const url = `${window.location.origin}/gallery#${item.id}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus("Link copied.");
        return;
      }

      window.prompt("Copy this link:", url);
      setStatus("Share link ready.");
    } catch {
      window.prompt("Copy this link:", url);
      setStatus("Share link ready.");
    }
  }

  useEffect(() => {
    loadGallery();

    const channel = supabase
      .channel("gallery-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_items" }, () => loadGallery())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="bg-black">
      {status && (
        <div className="fixed top-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 border border-white/20 px-5 py-3 text-sm font-bold text-[#ffd95a]">
          {status}
        </div>
      )}

      <div className="h-[calc(100vh-104px)] overflow-y-scroll snap-y snap-mandatory">
        {items.length ? (
          items.map((item) => {
            const comments = Array.isArray(item.comments) ? item.comments : [];

            return (
              <article
                id={item.id}
                key={item.id}
                className="relative h-[calc(100vh-104px)] w-full snap-start overflow-hidden bg-black"
              >
                {item.file_type?.startsWith("video") ? (
                  <video
                    src={item.file_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onClick={() => setSelectedItem(item)}
                    className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                  />
                ) : (
                  <img
                    src={item.file_url}
                    onClick={() => setSelectedItem(item)}
                    className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />

                <div className="absolute left-4 right-24 bottom-16 z-10 md:left-12 md:right-36 bg-transparent p-0 max-w-[260px]">
                  <p className="text-[#ffd95a] tracking-[.25em] text-[10px] font-black mb-1">
                    RR MOMENT
                  </p>

                  <h1 className="text-[22px] md:text-5xl font-black leading-tight max-w-[220px]">
                    {item.title || "Behind The Frequencies"}
                  </h1>

                  {openComments?.id === item.id && comments.length > 0 && (
                    <p className="mt-2 rounded-xl bg-black/60 border border-white/10 px-3 py-2 text-xs">
                      <span className="text-[#ffd95a] font-black">
                        {comments[comments.length - 1].name}:
                      </span>{" "}
                      {comments[comments.length - 1].text}
                    </p>
                  )}
                </div>

                <div className="absolute right-3 bottom-36 z-20 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => likePost(item)}
                    className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur font-black text-lg"
                  >
                    🔥
                  </button>
                  <span className="text-xs font-black">{item.likes || 0}</span>

                  <button
                    type="button"
                    onClick={() => setOpenComments(openComments?.id === item.id ? null : item)}
                    className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur font-black text-lg"
                  >
                    💬
                  </button>
                  <span className="text-xs font-black">{comments.length}</span>

                  <button
                    type="button"
                    onClick={() => sharePost(item)}
                    className="w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur font-black text-lg"
                  >
                    ↗
                  </button>
                </div>

                {openComments?.id === item.id && (
                <div className="absolute left-4 right-4 bottom-6 z-30 flex gap-2 items-center">
                  <input
                    value={commentText[item.id] || ""}
                    onChange={(e) =>
                      setCommentText({ ...commentText, [item.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addComment(item);
                    }}
                    placeholder="Add a comment..."
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-base"
                  />

                  <button
                    type="button"
                    onClick={() => addComment(item)}
                    className="rounded-2xl bg-gradient-to-r from-[#25c8ff] to-[#ffd95a] px-5 py-3 font-black text-black shrink-0"
                  >
                    Send
                  </button>
                </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center px-6">
            <div className="card max-w-xl text-center">
              <h1 className="text-5xl font-black mb-4">No Gallery Uploads Yet</h1>
              <p className="text-white/60">Upload from Owner Dashboard.</p>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[1000000] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 z-20 rounded-full bg-white/10 border border-white/20 w-12 h-12 font-black text-xl"
          >
            ×
          </button>

          {selectedItem.file_type?.startsWith("video") ? (
            <video
              src={selectedItem.file_url}
              controls
              autoPlay
              playsInline
              className="max-h-[92vh] max-w-[100vw] object-contain"
            />
          ) : (
            <img
              src={selectedItem.file_url}
              className="max-h-[92vh] max-w-[100vw] object-contain"
            />
          )}
        </div>
      )}

    </section>
  );
}
