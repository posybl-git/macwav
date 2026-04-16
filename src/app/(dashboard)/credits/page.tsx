"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function CreditsPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Buy Credits</h1>
      <p className="text-muted-foreground mb-8">
        Check your current balance and continue to the purchase page when ready
      </p>

      {/* Current Balance */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-muted-foreground" />
          <span className="text-4xl font-bold text-foreground">
            {(profile?.credit_balance ?? 0).toLocaleString()}
          </span>
          <span className="text-muted-foreground text-lg">credits</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Open the purchase flow
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              The actual Stripe checkout is now on the purchase page. This page
              is kept as the credits overview so the sidebar still has a clean
              landing view.
            </p>
            <Link
              href="/credits/purchase"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200"
            >
              <CreditCard className="w-5 h-5" />
              Buy Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
