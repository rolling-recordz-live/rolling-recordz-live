"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    async function verify() {
      const sessionId = params.get("session_id");
      const item = params.get("item") || "unknown";

      if (!sessionId) {
        setStatus("Missing payment session.");
        return;
      }

      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, item }),
      });

      if (!res.ok) {
        setStatus("Payment verified by Stripe, but saving failed.");
        return;
      }

      setStatus("Payment confirmed and saved.");
    }

    verify();
  }, [params]);

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="card max-w-2xl mx-auto text-center">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-3">
          PAYMENT COMPLETE
        </p>

        <h1 className="text-5xl font-black mb-5">
          Rolling Recordz Payment
        </h1>

        <p className="text-white/70 mb-8">{status}</p>

        <Link href="/upload?paid=success" className="btn inline-block">
          Continue
        </Link>
      </div>
    </section>
  );
}
