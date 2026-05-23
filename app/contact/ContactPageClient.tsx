"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { findOffer, SERVICES, PACKAGES } from "@/lib/services";

export default function ContactPage() {
  const params = useSearchParams();
  const offerParam = params.get("offer");
  const offer = findOffer(offerParam);

  const [selected, setSelected] = useState(offer.slug);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedOffer = findOffer(selected);
  const allOffers = [...SERVICES, ...PACKAGES];

  async function payDeposit() {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: selectedOffer.slug }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function bookService(e: any) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const form = new FormData(e.target);

    const { error } = await supabase.from("service_requests").insert({
      name: form.get("name"),
      email: form.get("email"),
      service: selectedOffer.title,
      budget: form.get("budget"),
      details: form.get("details"),
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    e.target.reset();
    setMsg("Booking request sent. Rolling Recordz will contact you by email.");
  }

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <div className="card">
          <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">
            BOOKING EXPERIENCE
          </p>

          <h1 className="text-5xl font-black mb-5">
            {selectedOffer.title}
          </h1>

          <p className="text-white/70 text-lg leading-8 mb-8">
            {selectedOffer.desc}
          </p>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 mb-6">
            <p className="text-white/50 mb-2">Starting Price</p>
            <p className="text-[#25c8ff] text-5xl font-black">
              {selectedOffer.price}
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/20 aspect-video flex items-center justify-center text-white/30">
            Service Preview Area
          </div>
        </div>

        <form onSubmit={bookService} className="card grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <p className="text-[#ffd95a] tracking-[.3em] text-xs font-black mb-2">
              CLIENT DETAILS
            </p>

            <h2 className="text-5xl font-black">
              Start Your Booking
            </h2>
          </div>

          <input
            name="name"
            required
            placeholder="Name"
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          />

          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          />

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          >
            {allOffers.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>

          <select
            name="budget"
            className="bg-black/30 border border-white/10 rounded-xl p-4"
          >
            <option>Just researching</option>
            <option>$150 - $350</option>
            <option>$500 - $1000</option>
            <option>$1000+</option>
          </select>

          <textarea
            name="details"
            placeholder="Tell Rolling Recordz about your project..."
            className="md:col-span-2 min-h-[180px] bg-black/30 border border-white/10 rounded-xl p-4"
          />

          <button disabled={loading} className="btn">
            {loading ? "Sending..." : "Submit Booking Request"}
          </button>

          <button type="button" onClick={payDeposit} className="ghost">
            Pay Deposit Now
          </button>

          {msg && (
            <div className="md:col-span-2 text-center font-bold text-[#25c8ff]">
              {msg}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
