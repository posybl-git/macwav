import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function normalizeSecret(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "") ?? null;
}

const stripeSecretKey = normalizeSecret(process.env.STRIPE_SECRET_KEY);
const webhookSecret = normalizeSecret(process.env.STRIPE_WEBHOOK_SECRET);

export async function POST(request: Request) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook configuration is missing" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id;
  const creditAmount = Number(session.metadata?.credit_amount ?? 0);
  const paymentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.id;
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? undefined;

  if (!userId || !creditAmount || !paymentId) {
    return NextResponse.json(
      { error: "Missing checkout metadata" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const description = `Purchased ${creditAmount.toLocaleString()} credits via Stripe`;

  const { data: existingTransaction } = await (admin
    .from("credit_transactions") as any)
    .select("id")
    .eq("stripe_payment_id", paymentId)
    .maybeSingle();

  if (existingTransaction) {
    return NextResponse.json({ received: true });
  }

  const { data: balance, error } = await (admin as any).rpc(
    "record_credit_purchase",
    {
    p_user_id: userId,
    p_amount: creditAmount,
    p_stripe_payment_id: paymentId,
    p_description: description,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY && customerEmail) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "macwav <notifications@macwav.app>",
        to: [customerEmail],
        subject: "Credits Added",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
            <h2 style="margin:0 0 16px">Credits Added</h2>
            <p>Your macwav balance has been updated successfully.</p>
            <p><strong>Credits added:</strong> ${creditAmount.toLocaleString()}</p>
            <p><strong>New balance:</strong> ${(balance ?? 0).toLocaleString()}</p>
          </div>
        `,
      }),
    });
  }

  return NextResponse.json({ received: true });
}
