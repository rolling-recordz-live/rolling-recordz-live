import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICES: Record<string, { name: string; amount: number }> = {
  submission: { name: "Rolling Recordz Artist Submission", amount: 500 },
  "records-20": { name: "20 Rolling Recordz Records", amount: 500 },
  "recording-studio": { name: "Recording Studio Deposit", amount: 5000 },
  "video-production": { name: "Video Production Deposit", amount: 10000 },
  "content-creation": { name: "Content Creation Deposit", amount: 5000 },
  "radio-promotion": { name: "Radio Promotion", amount: 2500 },
  "mobile-studio": { name: "Mobile Studio Deposit", amount: 15000 },
  branding: { name: "Branding Deposit", amount: 7500 },
  "starter-frequency": { name: "Starter Frequency Deposit", amount: 5000 },
  "artist-development": { name: "Artist Development Deposit", amount: 10000 },
  "mic-drop-performance": { name: "Mic Drop Performance Deposit", amount: 15000 },
  "radio-rotation": { name: "Radio Rotation", amount: 2500 },
  "mobile-studio-experience": { name: "Mobile Studio Experience Deposit", amount: 15000 },
  "studio-frequencies": { name: "Studio Frequencies Deposit", amount: 25000 },
};

export async function POST(req: Request) {
  const { item = "submission" } = await req.json();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const price = PRICES[item] || PRICES.submission;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: price.name,
          },
          unit_amount: price.amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&item=${item}`,
    cancel_url: `${siteUrl}/contact`,
  });

  return NextResponse.json({ url: session.url });
}
