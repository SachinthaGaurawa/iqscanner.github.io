"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Layers } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUserDocuments } from "@/lib/documents";
import { Button } from "@/components/ui/Button";
import { buildPdfFromImages, downloadBlob } from "@/lib/pdf-export";
import { ToolCard } from "./ToolCard";

export function CombineScansTool() {
  const { user } = useAuth();
  const { docs } = useUserDocuments(user?.uid);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCombine() {
    const chosen = docs.filter((d) => selected.has(d.id));
    if (chosen.length === 0) return;
    setBusy(true);
    try {
      const urls = chosen.flatMap((d) => d.pageUrls);
      const blob = await buildPdfFromImages(urls);
      downloadBlob(blob, "combined-scans.pdf");
      toast.success("PDF downloaded");
      setSelected(new Set());
    } catch {
      toast.error("Couldn't combine those documents.");
    } finally {
      setBusy(false);
    }
  }

  const description = "Pick documents from My Files to merge into one PDF, in order.";

  if (docs.length === 0) {
    return (
      <ToolCard icon={Layers} title="Combine my scans" description={description}>
        <p className="text-xs text-slate-500">Scan a few documents first — they&apos;ll show up here.</p>
      </ToolCard>
    );
  }

  return (
    <ToolCard icon={Layers} title="Combine my scans" description={description}>
      <div className="mb-4 flex max-h-48 flex-col gap-1 overflow-y-auto">
        {docs.map((doc) => (
          <label
            key={doc.id}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={selected.has(doc.id)}
              onChange={() => toggle(doc.id)}
              className="h-4 w-4 shrink-0 rounded accent-brand-500"
            />
            <span className="truncate text-sm text-slate-300">{doc.title}</span>
            <span className="ml-auto shrink-0 text-xs text-slate-600">{doc.pageCount}p</span>
          </label>
        ))}
      </div>
      <Button onClick={handleCombine} disabled={selected.size === 0 || busy} loading={busy} fullWidth>
        Combine{selected.size > 0 ? ` (${selected.size})` : ""}
      </Button>
    </ToolCard>
  );
}
