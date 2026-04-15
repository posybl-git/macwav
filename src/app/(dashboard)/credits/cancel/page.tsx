import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CreditsCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center rounded-xl border border-border bg-card p-8">
        <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Cancelled
        </h1>
        <p className="text-muted-foreground mb-6">
          No charge was made. You can try again whenever you&apos;re ready.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/credits/purchase"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-border text-foreground font-semibold hover:bg-muted/50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
