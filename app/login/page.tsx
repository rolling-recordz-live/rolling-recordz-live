"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function login() {
    setStatus("Sending login link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error(error);
      setStatus(error.message || "Error sending magic link email");
      return;
    }

    setStatus("Check your email for the login link.");
  }

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="card max-w-2xl mx-auto">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          ARTIST ACCOUNT
        </p>

        <h1 className="text-5xl md:text-7xl font-black mb-6">
          Artist Login
        </h1>

        <p className="text-white/70 mb-8">
          Enter your email to access your Rolling Recordz artist dashboard,
          track your progress, and see your rewards.
        </p>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="artist@email.com"
          type="email"
          className="w-full bg-black/30 border border-white/10 rounded-xl p-4 mb-4"
        />

        <button onClick={login} className="btn w-full">
          Send Login Link
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
