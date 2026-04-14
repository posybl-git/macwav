"use client";

import Link from "next/link";
import { Music, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";

type Song = Database["public"]["Tables"]["songs"]["Row"];

function getPackageColor(pkg: string) {
  switch (pkg) {
    case "LAUNCH":
      return "bg-primary text-primary-foreground";
    case "CREATE":
      return "bg-success text-white";
    case "BUILD":
      return "bg-alert text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "border-accent text-accent";
    case "completed":
      return "border-success text-success";
    default:
      return "border-muted-foreground text-muted-foreground";
  }
}

export default function MySongsPage() {
  const { loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      setSongs(data ?? []);
      setLoading(false);
    };

    fetchSongs();
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Songs</h1>
          <p className="text-muted-foreground mt-1">
            {songs.length} projects
          </p>
        </div>
        <Link
          href="/songs/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200"
        >
          Start a Song
        </Link>
      </div>

      {/* Song List */}
      {songs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
          <Music className="w-16 h-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            No songs yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Start your first song project to get going.
          </p>
          <Link
            href="/songs/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Start a Song
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
            >
              {/* Song Icon */}
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium text-lg group-hover:text-primary transition-colors">
                  {song.song_name}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${getPackageColor(
                      song.package_tier
                    )}`}
                  >
                    {song.package_tier}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stage: {song.current_stage}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border text-xs font-medium ${getStatusColor(
                      song.status
                    )}`}
                  >
                    {song.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
