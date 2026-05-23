"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TipArtistButton({ artist }: { artist: any }) {
  const [status, setStatus] = useState("");

  async function tip(records: number) {
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;

    if (!email) {
      window.location.href = "/login";
      return;
    }

    const wallet = await supabase
      .from("fan_wallets")
      .select("*")
      .eq("email", email)
      .single();

    const balance = wallet.data?.records || 0;

    if (balance < records) {
      setStatus("Not enough Records. Add more in your fan dashboard.");
      return;
    }

    const dollarValue = records * 0.25;
    const rrFee = dollarValue * 0.02;
    const artistValue = dollarValue - rrFee;

    await supabase
      .from("fan_wallets")
      .update({ records: balance - records })
      .eq("email", email);

    await supabase.from("record_transactions").insert({
      fan_email: email,
      artist_id: artist.id,
      artist_name: artist.artist,
      type: "tip",
      records,
      dollar_value: dollarValue,
      rr_fee: rrFee,
      artist_value: artistValue,
    });

    await supabase
      .from("artist_uploads")
      .update({
        tips_records: (artist.tips_records || 0) + records,
        stars: (artist.stars || 0) + records,
      })
      .eq("id", artist.id);

    setStatus(`Sent ${records} Records to ${artist.artist}.`);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
      <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
        TIP ARTIST
      </p>

      <div className="flex gap-3 flex-wrap">
        <button onClick={() => tip(4)} className="btn">4 Records</button>
        <button onClick={() => tip(10)} className="ghost">10 Records</button>
        <button onClick={() => tip(20)} className="ghost">20 Records</button>
      </div>

      {status && <p className="text-[#25c8ff] font-bold mt-4">{status}</p>}
    </div>
  );
}
