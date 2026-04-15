import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCreditBundleByCredits } from "@/lib/credits";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { creditAmount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const creditAmount = Number(body.creditAmount);
  const bundle = getCreditBundleByCredits(creditAmount);

  if (!bundle) {
    return NextResponse.json({ error: "Invalid credit bundle" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-24.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    success_url: `${appUrl}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/credits/cancel`,
    metadata: {
      user_id: user.id,
      credit_amount: String(bundle.credits),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: bundle.priceInCents,
          product_data: {
            name: `${bundle.credits.toLocaleString()} Credits`,
            description: `macwav credit bundle`,
          },
        },
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}
