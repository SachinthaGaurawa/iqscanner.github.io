"use client";

import { motion } from "motion/react";
import { Files, FolderOpen, HardDrive, ScanLine, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GuestBanner } from "@/components/dashboard/GuestBanner";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.isAnonymous
    ? "Guest"
    : (user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Here&apos;s what&apos;s happening with your documents today.
        </p>
      </div>

      {user?.isAnonymous && <GuestBanner />}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Files} label="Documents scanned" value="0" />
        <StatCard icon={HardDrive} label="Storage used" value="0 MB" hint="Free forever, no limits" />
        <StatCard icon={Sparkles} label="Current plan" value="Premium — Free" />
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-600/10 via-brand-500/5 to-accent-500/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-600/30">
          <ScanLine className="h-7 w-7 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Scan your first document</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Live camera capture with AI edge detection and OCR is arriving in
          the next update, ready the moment it ships to this account.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
          <Sparkles className="h-3 w-3" />
          Coming soon
        </span>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent documents
        </h2>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <FolderOpen className="mb-3 h-9 w-9 text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No documents yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Once scanning launches, every document you capture will be saved
            here and synced instantly across all your devices.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
