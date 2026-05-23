import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const genre = url.searchParams.get("genre");

  let query = supabase
    .from("artist_uploads")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (genre && genre !== "All") {
    query = query.eq("genre", genre);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ tracks: [], error: error.message });
  }

  const tracks = (data || []).filter(
    (t) =>
      t.song_url &&
      t.song_url !== "EMPTY" &&
      t.song_url.startsWith("http")
  );

  return NextResponse.json({
    tracks,
    count: tracks.length,
  });
}
