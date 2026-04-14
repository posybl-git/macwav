"use client";

import { CalendarDays } from "lucide-react";

export default function SchedulePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Book a Session
      </h1>
      <p className="text-muted-foreground mb-8">
        Select an available time slot
      </p>

      {/* Coming Soon Card */}
      <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-center">
        <CalendarDays className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-bold text-foreground mb-2">
          Scheduling Coming Soon
        </h2>
        <p className="text-muted-foreground max-w-md">
          Session booking will be available once the backend is connected.
        </p>
      </div>
    </div>
  );
}
