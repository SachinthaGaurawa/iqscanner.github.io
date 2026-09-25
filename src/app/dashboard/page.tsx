"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Files, FolderOpen, HardDrive, Loader2, ScanLine, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GuestBanner } from "@/components/dashboard/GuestBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { useUserDocuments } from "@/lib/documents";

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 0.1 ? "< 0.1 MB" : `${mb.toFixed(1)} MB`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { docs, loading } = useUserDocuments(user?.uid);

  if (!user) return null;

  const firstName = user.isAnonymous
    ? "Guest"
    : (user.displayName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there");

  const totalBytes = docs.reduce((sum, d) => sum + d.sizeBytes, 0);

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
        <StatCard icon={Files} label="Documents scanned" value={String(docs.length)} />
        <StatCard
          icon={HardDrive}
          label="Storage used"
          value={formatBytes(totalBytes)}
          hint="Free forever, no limits"
        />
        <StatCard icon={Sparkles} label="Current plan" value="Premium — Free" />
      </div>

      <Link
        href="/dashboard/scan"
        className="mb-8 block overflow-hidden rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-600/10 via-brand-500/5 to-accent-500/10 p-8 text-center transition-colors hover:border-brand-400/40"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-600/30">
          <ScanLine className="h-7 w-7 text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-white">Scan a document</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Auto edge detection, perspective correction, and enhancement filters
          — right from your camera.
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
          <Sparkles className="h-3 w-3" />
          Start scanning
        </span>
      </Link>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent documents
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <FolderOpen className="mb-3 h-9 w-9 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No documents yet</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Scan your first document and it will show up here, synced
              instantly across all your devices.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {docs.map((record) => (
              <DocumentCard key={record.id} uid={user.uid} record={record} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
