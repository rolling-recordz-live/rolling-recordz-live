"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const MEMBERSHIPS = [
  {
    id: "bronze",
    name: "Bronze",
    price: "$5/mo",
    records: "20 Monthly Records",
    short: "For listeners who want to support the movement.",
    perks: [
      "20 Records every month",
      "Vote boost on artists",
      "Newsletter access",
      "Early community updates",
      "Supporter badge coming soon",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: "$15/mo",
    records: "75 Monthly Records",
    short: "For serious Record Players who want more control.",
    perks: [
      "75 Records every month",
      "Exclusive artist drops",
      "Private listening rooms",
      "Priority community votes",
      "Early access to new radio features",
      "Create favorite artist channels coming soon",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "$50/mo",
    records: "300 Monthly Records",
    short: "For top supporters, tastemakers, and culture builders.",
    perks: [
      "300 Records every month",
      "Artist live sessions",
      "Event priority",
      "Private backstage access coming soon",
      "Create your own artist station coming soon",
      "Pandora-style artist radio controls coming soon",
      "Exclusive giveaways and drops",
    ],
  },
];

export default function RecordPlayersPage() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [openPlan, setOpenPlan] = useState<any | null>(null);

  async function load() {
    const { data } = await supabase.auth.getUser();
    const userEmail = data.user?.email;

    if (!userEmail) {
      window.location.href = "/record-player-login";
      return;
    }

    setEmail(userEmail);

    const walletRow = await supabase
      .from("fan_wallets")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (!walletRow.data) {
      await supabase.from("fan_wallets").insert({
        email: userEmail,
        records: 0,
      });
    }

    const freshWallet = await supabase
      .from("fan_wallets")
      .select("*")
      .eq("email", userEmail)
      .single();

    const tx = await supabase
      .from("record_transactions")
      .select("*")
      .eq("fan_email", userEmail)
      .order("created_at", { ascending: false });

    const memberRow = await supabase
      .from("memberships")
      .select("*")
      .eq("email", userEmail)
      .single();

    setWallet(freshWallet.data);
    setTransactions(tx.data || []);
    setMembership(memberRow.data);
  }

  async function buyRecords() {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: "records-20" }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function buyMembership(type: string) {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: type }),
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  useEffect(() => {
    load();
  }, []);

  const tipped = transactions.filter((t) => t.type === "tip");
  const bought = transactions.filter((t) => t.type === "purchase");

  return (
    <section className="px-6 md:px-20 py-10">
      <div className="mb-8">
        <p className="text-[#ffd95a] tracking-[.3em] text-sm font-black mb-2">
          RECORD PLAYERS
        </p>

        <h1 className="text-5xl md:text-8xl font-black">
          Record Player Vault
        </h1>

        <p className="text-white/60 mt-3">
          Logged in as {email}
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <aside className="space-y-6">
          <div className="card">
            <p className="text-white/50">Records Balance</p>

            <h2 className="text-7xl font-black text-[#ffd95a] mb-4">
              {wallet?.records || 0}
            </h2>

            <p className="text-white/60 mb-6">
              $5 = 20 Records. Use Records to support artists, unlock drops,
              boost votes, and become part of the movement.
            </p>

            <button onClick={buyRecords} className="btn w-full">
              Load 20 Records — $5
            </button>
          </div>

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              STATUS
            </p>

            <h2 className="text-4xl font-black text-[#25c8ff] capitalize">
              {membership?.active ? membership.membership : "Not Subscribed"}
            </h2>

            <p className="text-white/60 mt-3">
              Subscribe to unlock monthly Records, private rooms, exclusive
              drops, and future artist station controls.
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-white/50">Artists Tipped</p>
              <h2 className="text-5xl font-black text-[#25c8ff]">
                {tipped.length}
              </h2>
            </div>

            <div className="card">
              <p className="text-white/50">Songs Bought</p>
              <h2 className="text-5xl font-black text-[#ffd95a]">
                {bought.length}
              </h2>
            </div>

            <div className="card">
              <p className="text-white/50">Membership</p>
              <h2 className="text-3xl font-black text-[#25c8ff] capitalize">
                {membership?.active ? membership.membership : "Free"}
              </h2>
            </div>
          </div>

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              MEMBERSHIPS
            </p>

            <h2 className="text-4xl font-black mb-6">
              Choose Your Player Level
            </h2>

            <div className="grid lg:grid-cols-3 gap-5">
              {MEMBERSHIPS.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl border border-white/10 bg-black/30 p-5 flex flex-col"
                >
                  <h3 className="text-3xl font-black mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-[#ffd95a] text-3xl font-black mb-2">
                    {plan.price}
                  </p>

                  <p className="text-[#25c8ff] font-black mb-4">
                    {plan.records}
                  </p>

                  <p className="text-white/60 mb-5">
                    {plan.short}
                  </p>

                  <div className="mt-auto flex gap-3 flex-wrap">
                    <button
                      onClick={() => buyMembership(plan.id)}
                      className="btn"
                    >
                      Join
                    </button>

                    <button
                      onClick={() => setOpenPlan(plan)}
                      className="ghost"
                    >
                      More Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {membership?.active && (
            <div className="card border-[#ffd95a]/30">
              <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
                UNLOCKED PERKS
              </p>

              <h2 className="text-4xl font-black mb-5 capitalize">
                {membership.membership} Access
              </h2>

              <div className="grid md:grid-cols-2 gap-4 text-white/70">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">✅ Monthly Records bonus unlocked</div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">✅ Vote boosts unlocked</div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">✅ Exclusive drops access</div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">✅ Private listening rooms coming soon</div>
                {(membership.membership === "gold" || membership.membership === "platinum") && (
                  <div className="rounded-2xl border border-[#25c8ff]/30 bg-black/30 p-4">✅ Artist station controls coming soon</div>
                )}
                {membership.membership === "platinum" && (
                  <div className="rounded-2xl border border-[#ffd95a]/30 bg-black/30 p-4">✅ Backstage / live session priority</div>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              ACTIVITY
            </p>

            <h2 className="text-4xl font-black mb-6">
              Your Movement History
            </h2>

            <div className="space-y-4">
              {transactions.length ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="border-b border-white/10 pb-4">
                    <p className="font-black text-xl">
                      {tx.artist_name || tx.type}
                    </p>

                    <p className="text-white/60">
                      {tx.records} Records • ${tx.dollar_value}
                    </p>

                    <p className="text-white/40 text-sm">
                      {tx.type}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-white/60">
                  No activity yet. Tip an artist or buy Records to start your vault.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      {openPlan && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur flex items-end md:items-center justify-center">
          <div className="w-full md:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-[32px] md:rounded-[32px] border border-white/15 bg-[#070b14] p-6">
            <p className="text-[#ffd95a] tracking-[.25em] text-xs font-black mb-3">
              MEMBERSHIP DETAILS
            </p>

            <h2 className="text-5xl font-black mb-2">
              {openPlan.name}
            </h2>

            <p className="text-[#25c8ff] text-3xl font-black mb-6">
              {openPlan.price}
            </p>

            <div className="space-y-3 mb-8">
              {openPlan.perks.map((perk: string) => (
                <div
                  key={perk}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/80"
                >
                  {perk}
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => buyMembership(openPlan.id)}
                className="btn"
              >
                Join {openPlan.name}
              </button>

              <button
                onClick={() => setOpenPlan(null)}
                className="ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
