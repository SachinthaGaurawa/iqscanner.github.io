"use client";

import { Logo } from "@/components/Logo";
import type { User } from "firebase/auth";

// Purely a friendly visual reference — Quick Scanner never actually caps storage.
const VISUAL_CAP_BYTES = 1024 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb < 0.1 ? "< 0.1" : mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function StorageHeader({ user, totalBytes }: { user: User; totalBytes: number }) {
  const name = user.isAnonymous
    ? "Guest"
    : (user.displayName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there");
  const initial = name.charAt(0).toUpperCase();
  const percent = Math.min(100, (totalBytes / VISUAL_CAP_BYTES) * 100);

  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {user.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.photoURL} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
          {initial}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold text-white">Hi, {name} 👋</p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-slate-400">{formatBytes(totalBytes)} used</span>
        </div>
      </div>
      <Logo size={28} className="hidden shrink-0 sm:block" />
    </div>
  );
}
