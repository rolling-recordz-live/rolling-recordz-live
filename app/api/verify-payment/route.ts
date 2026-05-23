import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { sessionId, item } = await req.json();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const email = session.customer_details?.email || "";

  await supabaseAdmin.from("payments").upsert({
    stripe_session_id: session.id,
    item,
    customer_email: email,
    amount_total: session.amount_total || 0,
    currency: session.currency || "usd",
    payment_status: session.payment_status,
  });

  if (email && session.payment_status === "paid") {
    const membershipMap: Record<string, { records: number; name: string }> = {
      bronze: { records: 20, name: "bronze" },
      gold: { records: 75, name: "gold" },
      platinum: { records: 300, name: "platinum" },
    };

    if (item === "records-20") {
      const existing = await supabaseAdmin
        .from("fan_wallets")
        .select("*")
        .eq("email", email)
        .single();

      const current = existing.data?.records || 0;

      await supabaseAdmin.from("fan_wallets").upsert({
        email,
        records: current + 20,
      });

      await supabaseAdmin.from("record_transactions").insert({
        fan_email: email,
        type: "records_purchase",
        records: 20,
        dollar_value: 5,
        rr_fee: 0,
        artist_value: 0,
      });
    }

    if (membershipMap[item]) {
      const plan = membershipMap[item];

      await supabaseAdmin.from("memberships").upsert({
        email,
        membership: plan.name,
        records_bonus: plan.records,
        active: true,
      });

      const existing = await supabaseAdmin
        .from("fan_wallets")
        .select("*")
        .eq("email", email)
        .single();

      const current = existing.data?.records || 0;

      await supabaseAdmin.from("fan_wallets").upsert({
        email,
        records: current + plan.records,
      });
    }
  }

  return NextResponse.json({ ok: true, session });
}
