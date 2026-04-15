import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CreditsSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center rounded-xl border border-border bg-card p-8">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Payment Successful
        </h1>
        <p className="text-muted-foreground mb-6">
          Your credits have been added. The balance will refresh shortly.
        </p>
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
