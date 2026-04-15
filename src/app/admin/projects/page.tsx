import { createAdminClient } from "@/lib/supabase/admin";
import { Music } from "lucide-react";

export default async function AdminProjectsPage() {
  const admin = createAdminClient();

  const { data: songs } = await (admin.from("songs") as any)
    .select("id, song_name, package_tier, current_stage, status, revision_count, created_at, profiles(first_name, last_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Projects</h1>
      <p className="text-muted-foreground mb-8">View song projects and progress</p>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Music className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">All Songs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Song</th>
                <th className="px-6 py-4 font-medium">Artist</th>
                <th className="px-6 py-4 font-medium">Package</th>
                <th className="px-6 py-4 font-medium">Stage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Revisions</th>
              </tr>
            </thead>
            <tbody>
              {(songs ?? []).map((song: any) => (
                <tr key={song.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-foreground font-medium">{song.song_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {song.profiles?.first_name || song.profiles?.email || "—"}
                  </td>
                  <td className="px-6 py-4">{song.package_tier}</td>
                  <td className="px-6 py-4">{song.current_stage}</td>
                  <td className="px-6 py-4 capitalize">{song.status}</td>
                  <td className="px-6 py-4">{song.revision_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
