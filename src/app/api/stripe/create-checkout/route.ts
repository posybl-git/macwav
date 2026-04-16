import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCreditBundleByCredits, getStripePriceIdByCredits } from "@/lib/credits";

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
  const stripePriceId = getStripePriceIdByCredits(creditAmount);

  if (!bundle) {
    return NextResponse.json({ error: "Invalid credit bundle" }, { status: 400 });
  }

  if (!stripePriceId) {
    return NextResponse.json(
      { error: "Missing Stripe price id for selected bundle" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
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
        price: stripePriceId,
      },
    ],
  });

  return NextResponse.json({ url: session.url });
}
