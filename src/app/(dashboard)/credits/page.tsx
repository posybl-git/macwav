"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

const bundles = [
  { credits: 3000, price: "$99", popular: false },
  { credits: 7000, price: "$199", popular: true },
  { credits: 15000, price: "$399", popular: false },
];

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
        Select a credit bundle to add to your balance
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

      {/* Credit Bundles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bundles.map((bundle) => (
          <div
            key={bundle.credits}
            className={`relative rounded-xl border p-6 text-center transition-all duration-200 ${
              bundle.popular
                ? "border-primary bg-card shadow-[0_0_24px_rgba(144,90,246,0.15)]"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {bundle.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                Most Popular
              </span>
            )}

            <div className="pt-2 mb-4">
              <p className="text-4xl font-bold text-foreground">
                {bundle.credits.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">credits</p>
            </div>

            <p className="text-2xl font-bold text-foreground mb-6">
              {bundle.price}
            </p>

            <button
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                bundle.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)]"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
