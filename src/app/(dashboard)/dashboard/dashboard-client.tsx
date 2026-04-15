"use client";

import Link from "next/link";
import { CreditCard, Music, TrendingUp, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";

type Song = Database["public"]["Tables"]["songs"]["Row"];

export default function DashboardClient() {
  const { profile, loading: authLoading } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });

      setSongs(data ?? []);
      setSongsLoading(false);
    };

    fetchSongs();
  }, []);

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

  const activeSongs = songs.filter((s) => s.status === "active");
  const firstName = profile?.first_name || "Artist";

  if (authLoading) {
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {firstName}
          </p>
        </div>
        <Link
          href="/songs/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Start a Song
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Credit Balance</p>
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">
            {(profile?.credit_balance ?? 0).toLocaleString()}
          </p>
          <Link
            href="/credits"
            className="inline-block mt-2 text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Buy more →
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <Music className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">
            {activeSongs.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {songs.length} total
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">
            {songs.length > 0 ? "0%" : "—"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Across all projects
          </p>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">My Songs</h2>
          <Link
            href="/songs"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            View all
          </Link>
        </div>

        {songsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : songs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
            <Music className="w-16 h-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No songs yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Start your first song project to get going. Choose a package and
              we&apos;ll take care of the rest.
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
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                    {song.song_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
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
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded border text-xs font-medium ${
                      song.status === "active"
                        ? "border-accent text-accent"
                        : song.status === "completed"
                        ? "border-success text-success"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {song.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}