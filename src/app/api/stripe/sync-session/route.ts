import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

type SyncRequestBody = {
  sessionId?: string;
};

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

  let body: SyncRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json(
      { error: "Unable to retrieve Stripe session" },
      { status: 400 }
    );
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Checkout session is not paid yet" },
      { status: 400 }
    );
  }

  const userId = session.metadata?.user_id;
  const creditAmount = Number(session.metadata?.credit_amount ?? 0);
  const paymentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.id;

  if (!userId || !creditAmount || !paymentId) {
    return NextResponse.json(
      { error: "Missing checkout metadata" },
      { status: 400 }
    );
  }

  if (userId !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: existingTransaction } = await (admin
    .from("credit_transactions") as any)
    .select("id")
    .eq("stripe_payment_id", paymentId)
    .maybeSingle();

  if (existingTransaction) {
    const { data: profile } = await (admin.from("profiles") as any)
      .select("credit_balance")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      received: true,
      balance: profile?.credit_balance ?? 0,
      alreadySynced: true,
    });
  }

  const description = `Purchased ${creditAmount.toLocaleString()} credits via Stripe`;

  const { data: balance, error } = await (admin as any).rpc(
    "record_credit_purchase",
    {
    p_user_id: user.id,
    p_amount: creditAmount,
    p_stripe_payment_id: paymentId,
    p_description: description,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    received: true,
    balance: balance ?? 0,
  });
}