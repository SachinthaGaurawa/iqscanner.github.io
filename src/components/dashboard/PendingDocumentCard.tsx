"use client";

import { useState } from "react";
import { CloudOff, Download, Loader2, Trash2 } from "lucide-react";
import type { PendingDocument } from "@/lib/offline-store";
import { removePendingDocument } from "@/lib/offline-store";
import { buildPdfFromImages, downloadBlob } from "@/lib/pdf-export";
import toast from "react-hot-toast";

export function PendingDocumentCard({ doc }: { doc: PendingDocument }) {
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await buildPdfFromImages(doc.pages.map((p) => p.dataUrl));
      downloadBlob(blob, `${doc.title || "scan"}.pdf`);
    } catch {
      toast.error("Couldn't download this document.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.title}"? This scan hasn't synced yet and can't be undone.`)) return;
    setBusy("delete");
    await removePendingDocument(doc.id);
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-ink-800">
        {doc.pages[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.pages[0].dataUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{doc.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-amber-300">
          <CloudOff className="h-3 w-3" />
          Waiting to sync · {doc.pages.length} page{doc.pages.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={handleDownload}
          disabled={busy !== null}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
          aria-label="Download PDF"
        >
          {busy === "download" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={busy !== null}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          aria-label="Delete document"
        >
          {busy === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
