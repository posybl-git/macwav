import { createAdminClient } from "@/lib/supabase/admin";
import { CalendarDays } from "lucide-react";

export default async function AdminSchedulePage() {
  const admin = createAdminClient();

  const { data: slots } = await (admin.from("schedule_slots") as any)
    .select("id, start_time, end_time, is_available, is_premium, created_at")
    .order("start_time", { ascending: true });

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Schedule</h1>
      <p className="text-muted-foreground mb-8">Manage session time slots</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Time Slots</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Start</th>
                <th className="px-6 py-4 font-medium">End</th>
                <th className="px-6 py-4 font-medium">Available</th>
                <th className="px-6 py-4 font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {(slots ?? []).map((slot: any) => (
                <tr key={slot.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-foreground">
                    {new Date(slot.start_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {new Date(slot.end_time).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{slot.is_available ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">{slot.is_premium ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
