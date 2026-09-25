"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import type { DocumentRecord } from "@/lib/documents";
import { deleteDocumentRecord } from "@/lib/documents";
import { buildPdfFromImages, downloadBlob } from "@/lib/pdf-export";

export function DocumentCard({ uid, record }: { uid: string; record: DocumentRecord }) {
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);

  async function handleDownload() {
    setBusy("download");
    try {
      const blob = await buildPdfFromImages(record.pageUrls);
      downloadBlob(blob, `${record.title || "scan"}.pdf`);
    } catch {
      toast.error("Couldn't download this document.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${record.title}"? This can't be undone.`)) return;
    setBusy("delete");
    try {
      await deleteDocumentRecord(uid, record);
    } catch {
      toast.error("Couldn't delete this document.");
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Link
        href={`/dashboard/documents/${record.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-ink-800">
          {record.pageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={record.pageUrls[0]} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{record.title}</p>
          <p className="text-xs text-slate-500">
            {record.pageCount} page{record.pageCount === 1 ? "" : "s"}
            {record.createdAt ? ` · ${record.createdAt.toLocaleDateString()}` : ""}
          </p>
        </div>
      </Link>

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
