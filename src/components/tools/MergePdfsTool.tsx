"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Combine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mergePdfFiles, downloadBlob } from "@/lib/pdf-export";
import { ToolCard } from "./ToolCard";

export function MergePdfsTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleMerge() {
    if (files.length < 2) return;
    setBusy(true);
    try {
      const blob = await mergePdfFiles(files);
      downloadBlob(blob, "merged.pdf");
      toast.success("PDF downloaded");
      setFiles([]);
    } catch {
      toast.error("Couldn't merge those PDFs — make sure they're valid PDF files.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolCard
      icon={Combine}
      title="Merge PDFs"
      description="Combine two or more PDF files into one, in the order you pick them."
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/20"
      />
      {files.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {files.length} file{files.length === 1 ? "" : "s"} selected
        </p>
      )}
      <Button onClick={handleMerge} disabled={files.length < 2 || busy} loading={busy} fullWidth className="mt-4">
        Merge PDFs
      </Button>
    </ToolCard>
  );
}
