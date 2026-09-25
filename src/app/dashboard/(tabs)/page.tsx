"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, CloudOff, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUserDocuments } from "@/lib/documents";
import { usePendingDocuments } from "@/lib/offline-store";
import { useOnlineStatus } from "@/lib/use-online-status";
import { StorageHeader } from "@/components/dashboard/StorageHeader";
import { ScanOptionsGrid } from "@/components/dashboard/ScanOptionsGrid";

export default function HomePage() {
  const { user } = useAuth();
  const { docs } = useUserDocuments(user?.uid);
  const pendingDocs = usePendingDocuments(user?.uid);
  const online = useOnlineStatus();

  if (!user) return null;

  const totalBytes = docs.reduce((sum, d) => sum + d.sizeBytes, 0);
  const recent = [
    ...pendingDocs.map((d) => ({ id: d.id, title: d.title, thumb: d.pages[0]?.dataUrl, pending: true })),
    ...docs.map((d) => ({ id: d.id, title: d.title, thumb: d.pageUrls[0], pending: false })),
  ].slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <StorageHeader user={user} totalBytes={totalBytes} />

      {!online && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
          <CloudOff className="h-4 w-4 shrink-0" />
          You&apos;re offline. Scans save on this device and sync automatically once you&apos;re back online.
        </div>
      )}

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Start scanning
      </h2>
      <ScanOptionsGrid />

      {recent.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent
            </h2>
            <Link
              href="/dashboard/files"
              className="flex items-center gap-0.5 text-xs font-medium text-brand-300 hover:text-brand-200"
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recent.map((item) => (
              <Link
                key={item.id}
                href={item.pending ? "/dashboard/files" : `/dashboard/documents/${item.id}`}
                className="w-24 shrink-0"
              >
                <div className="h-32 w-24 overflow-hidden rounded-xl border border-white/10 bg-ink-800">
                  {item.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">
                      <FileText className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-slate-400">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
