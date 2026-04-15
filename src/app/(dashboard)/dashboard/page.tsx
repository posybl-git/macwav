import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return <DashboardClient />;
}
