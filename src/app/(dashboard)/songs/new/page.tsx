"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const packages = [
  {
    name: "CREATE",
    credits: 3000,
    price: "$99",
    popular: false,
    deliverables: [
      "Beat / Instrumental",
      "Recording Session",
      "Rough Mix",
      "Professional Mixing",
      "Professional Mastering",
    ],
  },
  {
    name: "BUILD",
    credits: 7000,
    price: "$199",
    popular: true,
    deliverables: [
      "Beat / Instrumental",
      "Songwriting Session",
      "2x Recording Sessions",
      "Vocal Tuning",
      "Rough Mix (2 Revisions)",
      "Professional Mixing",
      "Professional Mastering",
    ],
  },
  {
    name: "LAUNCH",
    credits: 15000,
    price: "$399",
    popular: false,
    deliverables: [
      "Beat / Instrumental",
      "Songwriting Session",
      "3x Recording Sessions",
      "Vocal Tuning",
      "Full Production",
      "Rough Mix (3 Revisions)",
      "Professional Mixing",
      "Professional Mastering",
      "Music Video Consultation",
      "Distribution Setup",
    ],
  },
];

export default function NewSongPage() {
  const [songName, setSongName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Start a Song</h1>
      <p className="text-muted-foreground mb-8">
        Name your song and choose a package
      </p>

      {/* Song Name Input */}
      <div className="mb-8">
        <label
          htmlFor="song-name"
          className="text-sm font-medium text-foreground mb-2 block"
        >
          Song Name
        </label>
        <input
          id="song-name"
          type="text"
          placeholder="Enter your song name"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Package Cards */}
      <h2 className="text-xl font-bold text-foreground mb-4">
        Select Package
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg) => (
          <button
            key={pkg.name}
            onClick={() => setSelectedPackage(pkg.name)}
            className={`relative rounded-xl border p-6 text-left transition-all duration-200 ${
              selectedPackage === pkg.name
                ? "border-primary bg-primary/5 shadow-[0_0_24px_rgba(144,90,246,0.2)]"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                Most Popular
              </span>
            )}

            <div className="text-center mb-4 pt-2">
              <p className="text-3xl font-bold text-foreground">
                {pkg.credits.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">credits</p>
            </div>

            <p className="text-2xl font-bold text-foreground text-center mb-4">
              {pkg.price}
            </p>

            <ul className="space-y-2 mb-6">
              {pkg.deliverables.map((d, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>

            <div
              className={`w-full py-2.5 rounded-lg text-center font-semibold text-sm transition-all ${
                selectedPackage === pkg.name
                  ? "bg-primary text-primary-foreground"
                  : pkg.popular
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {selectedPackage === pkg.name ? "Selected" : "Select"}
            </div>
          </button>
        ))}
      </div>

      {/* Confirm */}
      <button
        disabled={!songName || !selectedPackage}
        className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        Confirm & Start
      </button>
    </div>
  );
}
