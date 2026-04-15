import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard } from "lucide-react";

export default async function AdminCreditsPage() {
  const admin = createAdminClient();

  const { data: transactions } = await (admin.from("credit_transactions") as any)
    .select("id, type, amount, balance_after, description, created_at, profiles(first_name, last_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Credits Log</h1>
      <p className="text-muted-foreground mb-8">Transaction history and balance tracking</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Balance After</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(transactions ?? []).map((tx: any) => (
                <tr key={tx.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-foreground font-medium">
                    {tx.profiles?.first_name || tx.profiles?.email || "—"}
                  </td>
                  <td className="px-6 py-4 capitalize">{tx.type}</td>
                  <td className="px-6 py-4">{tx.amount}</td>
                  <td className="px-6 py-4">{tx.balance_after}</td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.description}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
