import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Rolling Recordz Submission",
            description: "Fast Lane artist submission review",
          },
          unit_amount: 500,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/upload/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/upload`,
  });

  return NextResponse.json({ url: session.url });
}
