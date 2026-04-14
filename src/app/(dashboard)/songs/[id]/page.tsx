"use client";

import Link from "next/link";
import { ArrowLeft, Music, Circle, CheckCircle2, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Database } from "@/types/supabase";

type Song = Database["public"]["Tables"]["songs"]["Row"];
type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"];

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

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case "in_progress":
      return (
        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      );
    default:
      return <Circle className="w-5 h-5 text-muted-foreground" />;
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "completed":
      return "text-success";
    case "in_progress":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    default:
      return "Pending";
  }
}

export default function SongDetailPage() {
  const params = useParams();
  const songId = params.id as string;
  const [song, setSong] = useState<Song | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      const supabase = createClient();

      const { data: songData, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", songId)
        .single();

      if (error || !songData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setSong(songData);

      const { data: delData } = await supabase
        .from("deliverables")
        .select("*")
        .eq("song_id", songId)
        .order("sort_order", { ascending: true });

      setDeliverables(delData ?? []);
      setLoading(false);
    };

    fetchSong();

    // Realtime subscription for deliverables
    const supabase = createClient();
    const channel = supabase
      .channel(`deliverables-song-${songId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliverables",
          filter: `song_id=eq.${songId}`,
        },
        (payload) => {
          setDeliverables((prev) =>
            prev.map((d) =>
              d.id === payload.new.id ? (payload.new as Deliverable) : d
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [songId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !song) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Song not found
        </h2>
        <p className="text-muted-foreground mb-4">
          The song you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/songs"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to My Songs
        </Link>
      </div>
    );
  }

  const completedCount = deliverables.filter(
    (d) => d.status === "completed"
  ).length;
  const progress =
    deliverables.length > 0
      ? Math.round((completedCount / deliverables.length) * 100)
      : 0;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/songs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Songs
      </Link>

      {/* Song Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <Music className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {song.song_name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${getPackageColor(
                  song.package_tier
                )}`}
              >
                {song.package_tier}
              </span>
              <span className="text-sm text-muted-foreground">
                Stage: {song.current_stage}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{progress}%</p>
          <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Deliverables
        </h2>
        {deliverables.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No deliverables yet.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {deliverables.map((del) => (
              <div
                key={del.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(del.status)}
                  <span className="text-foreground font-medium">
                    {del.title}
                  </span>
                </div>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-md bg-muted ${getStatusBadgeColor(
                    del.status
                  )}`}
                >
                  {formatStatus(del.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mix Revisions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-foreground font-bold mb-2">Mix Revisions</h3>
        <p className="text-3xl font-bold text-foreground">
          {song.revision_count}{" "}
          <span className="text-base font-normal text-muted-foreground">
            revisions
          </span>
        </p>
      </div>
    </div>
  );
}
