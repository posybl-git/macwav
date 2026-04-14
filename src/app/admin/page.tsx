"use client";

import { Users, Music, CreditCard, CalendarDays } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  {
    label: "Users",
    description: "Manage artist accounts",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Projects",
    description: "View all songs & deliverables",
    href: "/admin/projects",
    icon: Music,
  },
  {
    label: "Credits Log",
    description: "Transaction history",
    href: "/admin/credits",
    icon: CreditCard,
  },
  {
    label: "Schedule",
    description: "Manage time slots",
    href: "/admin/schedule",
    icon: CalendarDays,
  },
];

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        Admin Overview
      </h1>
      <p className="text-muted-foreground mb-8">
        Platform management dashboard
      </p>

      {/* Stats Cards — placeholder data for now */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Total Artists</p>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">—</p>
          <p className="mt-2 text-sm text-muted-foreground">Registered users</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Active Projects</p>
            <Music className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">—</p>
          <p className="mt-2 text-sm text-muted-foreground">In progress</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">—</p>
          <p className="mt-2 text-sm text-muted-foreground">From credit sales</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-4xl font-bold text-foreground">—</p>
          <p className="mt-2 text-sm text-muted-foreground">This week</p>
        </div>
      </div>

      {/* Quick Access */}
      <h2 className="text-xl font-bold text-foreground mb-4">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-border bg-card p-6 hover:bg-muted/50 hover:border-primary/50 transition-all group"
          >
            <link.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
            <p className="text-foreground font-semibold group-hover:text-primary transition-colors">
              {link.label}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
