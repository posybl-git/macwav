import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const [
    { count: totalArtists },
    { count: activeProjects },
    { data: recentTx },
    { data: priorityClients },
  ] = await Promise.all([
    (admin.from("profiles") as any).select("id", { count: "exact", head: true }).eq("role", "artist"),
    (admin.from("songs") as any).select("id", { count: "exact", head: true }).eq("status", "active"),
    (admin.from("credit_transactions") as any)
      .select("*, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(10),
    (admin.from("profiles") as any)
      .select("id, first_name, last_name, email, credit_balance")
      .eq("is_priority", true)
      .eq("role", "artist"),
  ]);

  return NextResponse.json({ totalArtists, activeProjects, recentTx, priorityClients });
}
