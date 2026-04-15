import { createAdminClient } from "@/lib/supabase/admin";
import { Users } from "lucide-react";

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: users } = await (admin.from("profiles") as any)
    .select("id, first_name, last_name, email, role, is_priority, credit_balance, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
      <p className="text-muted-foreground mb-8">Manage artist and admin accounts</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">All Profiles</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Credits</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((user: any) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-foreground font-medium">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">{user.is_priority ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">{user.credit_balance}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
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
