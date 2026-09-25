"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buildPdfFromImageFiles, downloadBlob } from "@/lib/pdf-export";
import { ToolCard } from "./ToolCard";

export function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleConvert() {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const blob = await buildPdfFromImageFiles(files);
      downloadBlob(blob, "images.pdf");
      toast.success("PDF downloaded");
      setFiles([]);
    } catch {
      toast.error("Couldn't convert those images.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolCard
      icon={ImageIcon}
      title="Images to PDF"
      description="Turn photos from your gallery into a single PDF, one photo per page."
    >
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/20"
      />
      {files.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {files.length} image{files.length === 1 ? "" : "s"} selected
        </p>
      )}
      <Button
        onClick={handleConvert}
        disabled={files.length === 0 || busy}
        loading={busy}
        fullWidth
        className="mt-4"
      >
        Convert to PDF
      </Button>
    </ToolCard>
  );
}
