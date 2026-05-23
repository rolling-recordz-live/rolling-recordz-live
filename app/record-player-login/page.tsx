"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RecordPlayerLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function login() {
    if (!email.trim()) {
      setStatus("Enter your email.");
      return;
    }

    setStatus("Sending access link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/record-players`,
      },
    });

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Check your email for your Record Player access link.");
  }

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="card max-w-2xl mx-auto">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          RECORD PLAYERS
        </p>

        <h1 className="text-5xl md:text-7xl font-black mb-6">
          Record Player Login
        </h1>

        <p className="text-white/70 mb-8">
          Access your Records wallet, supported artists, purchased music,
          community activity, and future exclusive drops.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="recordplayer@email.com"
          type="email"
          className="w-full bg-black/30 border border-white/10 rounded-xl p-4 mb-4"
        />

        <button onClick={login} className="btn w-full">
          Send Access Link
        </button>

        {status && (
          <p className="text-[#25c8ff] font-bold mt-5 text-center">
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
