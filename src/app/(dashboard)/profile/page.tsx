"use client";

import { useEffect, useState } from "react";
import { User, Mail, Save, CalendarDays, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const fallbackProfile = user
    ? {
        id: user.id,
        email: user.email ?? "",
        first_name:
          typeof user.user_metadata?.first_name === "string"
            ? user.user_metadata.first_name
            : "",
        last_name:
          typeof user.user_metadata?.last_name === "string"
            ? user.user_metadata.last_name
            : "",
        role: "artist",
        is_priority: false,
        credit_balance: 0,
        created_at: user.created_at ?? new Date().toISOString(),
        updated_at: user.updated_at ?? new Date().toISOString(),
      }
    : null;

  const effectiveProfile = profile ?? fallbackProfile;

  const [firstName, setFirstName] = useState(effectiveProfile?.first_name ?? "");
  const [lastName, setLastName] = useState(effectiveProfile?.last_name ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [retryingProfile, setRetryingProfile] = useState(false);
  const [hasRetriedProfile, setHasRetriedProfile] = useState(false);

  // Derive display name — fall back to email when name is empty
  const fullName = [effectiveProfile?.first_name, effectiveProfile?.last_name]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || effectiveProfile?.email || user?.email || "User";
  const displayEmail = effectiveProfile?.email || user?.email || "";

  // Sync form state when profile data actually changes (use stable primitives, not object ref)
  const profileFirstName = profile?.first_name ?? null;
  const profileLastName = profile?.last_name ?? null;
  useEffect(() => {
    if (profileFirstName !== null) {
      setFirstName(profileFirstName);
    }
    if (profileLastName !== null) {
      setLastName(profileLastName);
    }
  }, [profileFirstName, profileLastName]);

  useEffect(() => {
    if (!authLoading && user && !profile && !hasRetriedProfile) {
      setHasRetriedProfile(true);
      setRetryingProfile(true);
      refreshProfile().finally(() => setRetryingProfile(false));
    }
  }, [authLoading, user, profile, hasRetriedProfile, refreshProfile]);



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/profiles/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg || "Failed to update profile.");
      } else {
        setSuccess(true);
        await refreshProfile();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || retryingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!effectiveProfile) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground mb-8">
          Manage your account settings
        </p>
        <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
          <p className="text-foreground font-medium mb-2">Profile not available yet</p>
          <p className="text-muted-foreground text-sm mb-4">
            Your account is signed in, but profile data has not loaded. Please retry.
          </p>
          <button
            type="button"
            onClick={() => refreshProfile()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
      <p className="text-muted-foreground mb-8">
        Manage your account settings
      </p>

      <div className="rounded-xl border border-border bg-card p-6 max-w-2xl">
        {/* Avatar + Name + Email */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              {displayName}
            </p>
            {/* Always show email when a name is available; when only email shows as name, show role instead */}
            {fullName ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {displayEmail}
                </p>
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground capitalize mt-0.5">
              {effectiveProfile.role}
            </p>
          </div>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* First Name / Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="profile-firstname"
                className="text-sm font-medium text-foreground"
              >
                First Name
              </label>
              <input
                id="profile-firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="profile-lastname"
                className="text-sm font-medium text-foreground"
              >
                Last Name
              </label>
              <input
                id="profile-lastname"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Email — read only */}
          <div className="space-y-2">
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="profile-email"
                type="email"
                value={effectiveProfile.email}
                disabled
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-muted border border-border text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          {/* Read-only Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Role */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Role
                </p>
              </div>
              <p className="text-foreground font-medium capitalize">
                {effectiveProfile.role}
              </p>
            </div>

            {/* Account Created */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Member Since
                </p>
              </div>
              <p className="text-foreground font-medium">
                {new Date(effectiveProfile.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Status */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                </div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Status
                </p>
              </div>
              <p className="text-foreground font-medium">Active</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            id="profile-save-btn"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(144,90,246,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
