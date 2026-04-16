"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function CreditsSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<"syncing" | "synced" | "error">(
    "syncing"
  );
  const [message, setMessage] = useState(
    "Finalizing your payment and updating your balance..."
  );

  useEffect(() => {
    const syncPayment = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        setMessage("Missing Stripe session id.");
        return;
      }

      try {
        const response = await fetch("/api/stripe/sync-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to sync payment.");
        }

        await refreshProfile();
        setStatus("synced");
        setMessage(
          `Your credits are updated. Current balance: ${(data.balance ?? 0).toLocaleString()}.`
        );
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to sync payment right now. Please refresh the page in a moment."
        );
      }
    };

    syncPayment();
  }, [refreshProfile, router, searchParams]);

  const isLoading = status === "syncing";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center rounded-xl border border-border bg-card p-8">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            status === "error" ? "bg-destructive/20" : "bg-success/20"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : status === "error" ? (
            <TriangleAlert className="w-8 h-8 text-destructive" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-success" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isLoading
            ? "Updating Balance"
            : status === "error"
            ? "Payment Received"
            : "Payment Successful"}
        </h1>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/credits"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors"
          >
            View Credits
          </Link>
        </div>
      </div>
    </div>
  );
}
