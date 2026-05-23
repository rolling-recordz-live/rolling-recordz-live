import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .single();

  return NextResponse.json(
    { value: data?.value || "" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
