"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Check, Download, FileText, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CameraView, type CaptureResult } from "@/components/scanner/CameraView";
import { ScannerLoading } from "@/components/scanner/ScannerLoading";
import { FilterPicker } from "@/components/scanner/FilterPicker";
import { PageStrip, type ScannedPage as PageStripPage } from "@/components/scanner/PageStrip";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loadOpenCv, type Cv } from "@/lib/scanner/opencv";
import { computeFilterPreviews, applyFilterToImage } from "@/lib/scanner/process-page";
import type { FilterId } from "@/lib/scanner/filters";
import { recognizeText } from "@/lib/ocr";
import { buildPdfFromImages, downloadBlob } from "@/lib/pdf-export";
import { createDocument } from "@/lib/documents";
import { addPendingDocument } from "@/lib/offline-store";
import { useOnlineStatus } from "@/lib/use-online-status";

interface CapturedPage {
  id: string;
  originalDataUrl: string;
  filter: FilterId;
  dataUrl: string;
}

type Stage = "camera" | "review" | "manage" | "saving" | "done";

export default function ScanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const online = useOnlineStatus();

  const [stage, setStage] = useState<Stage>("camera");
  const [savedOffline, setSavedOffline] = useState(false);
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Partial<Record<FilterId, string>>>({});
  const [applyingFilter, setApplyingFilter] = useState(false);
  const [title, setTitle] = useState(() => `Scan ${new Date().toLocaleDateString()}`);
  const [extractText, setExtractText] = useState(true);
  const [savingLabel, setSavingLabel] = useState("Saving…");

  const activePage = pages.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (stage !== "review" || !activePage) return;
    let cancelled = false;
    void loadOpenCv().then((cv) =>
      computeFilterPreviews(cv, activePage.originalDataUrl).then((p) => {
        if (!cancelled) setPreviews(p);
      }),
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, activePage?.id]);

  async function handleCapture(result: CaptureResult) {
    const id = crypto.randomUUID();
    const newPage: CapturedPage = {
      id,
      originalDataUrl: result.dataUrl,
      filter: "original",
      dataUrl: result.dataUrl,
    };
    setPages((prev) => [...prev, newPage]);
    setActiveId(id);
    setStage("review");

    if (!result.autoDetected) {
      toast("Edges weren't detected — using the full frame. You can retake if needed.", {
        icon: "⚠️",
      });
    }

    // Auto-apply the enhanced look by default; the user can switch it below.
    try {
      const cv: Cv = await loadOpenCv();
      const enhanced = await applyFilterToImage(cv, result.dataUrl, "magic");
      setPages((prev) => prev.map((p) => (p.id === id ? { ...p, filter: "magic", dataUrl: enhanced } : p)));
    } catch {
      // Keep the original if enhancement fails for any reason.
    }
  }

  async function handleFilterChange(filter: FilterId) {
    if (!activePage) return;
    setApplyingFilter(true);
    try {
      const cv = await loadOpenCv();
      const dataUrl =
        filter === "original"
          ? activePage.originalDataUrl
          : await applyFilterToImage(cv, activePage.originalDataUrl, filter);
      setPages((prev) =>
        prev.map((p) => (p.id === activePage.id ? { ...p, filter, dataUrl } : p)),
      );
    } catch {
      toast.error("Couldn't apply that filter — please try again.");
    } finally {
      setApplyingFilter(false);
    }
  }

  function handleRemovePage(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
    if (pages.length <= 1) setStage("camera");
  }

  async function handleSave() {
    if (!user || pages.length === 0) return;
    setStage("saving");
    const documentTitle = title.trim() || "Untitled scan";

    try {
      const pagePayload: { dataUrl: string; ocrText?: string }[] = [];
      for (let i = 0; i < pages.length; i++) {
        let ocrText: string | undefined;
        if (extractText) {
          setSavingLabel(`Reading text — page ${i + 1} of ${pages.length}…`);
          try {
            ocrText = await recognizeText(pages[i].dataUrl);
          } catch {
            ocrText = undefined;
          }
        }
        pagePayload.push({ dataUrl: pages[i].dataUrl, ocrText });
      }

      if (!online) {
        // No connection right now — queue it locally; SyncManager uploads it
        // automatically the moment connectivity (or the app) comes back.
        await addPendingDocument({
          id: crypto.randomUUID(),
          ownerId: user.uid,
          title: documentTitle,
          pages: pagePayload,
          createdAt: Date.now(),
        });
        setSavedOffline(true);
        setStage("done");
        return;
      }

      setSavingLabel("Uploading to your account…");
      try {
        await createDocument(user.uid, { title: documentTitle, pages: pagePayload });
        setSavedOffline(false);
      } catch (uploadErr) {
        // Upload failed mid-flight (connection dropped, etc) — don't lose the
        // scan, queue it for the next automatic sync attempt instead.
        console.error(uploadErr);
        await addPendingDocument({
          id: crypto.randomUUID(),
          ownerId: user.uid,
          title: documentTitle,
          pages: pagePayload,
          createdAt: Date.now(),
        });
        setSavedOffline(true);
      }

      setStage("done");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save this document. Please try again.");
      setStage("manage");
    }
  }

  async function handleDownloadPdf() {
    try {
      const blob = await buildPdfFromImages(pages.map((p) => p.dataUrl));
      downloadBlob(blob, `${title.trim() || "scan"}.pdf`);
    } catch {
      toast.error("Couldn't build the PDF.");
    }
  }

  if (stage === "camera") {
    return (
      <CameraView
        onCapture={handleCapture}
        onCancel={() => (pages.length ? setStage("manage") : router.push("/dashboard"))}
      />
    );
  }

  if (stage === "review" && activePage) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
          {applyingFilter && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activePage.dataUrl} alt="Captured page" className="w-full" />
        </div>

        <FilterPicker value={activePage.filter} onChange={handleFilterChange} previews={previews} />

        <div className="flex flex-col gap-2">
          <Button onClick={() => setStage("camera")} variant="outline" fullWidth>
            Retake
          </Button>
          <Button onClick={() => setStage("manage")} fullWidth>
            <Check className="h-4 w-4" />
            Use this page
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "manage") {
    const stripPages: PageStripPage[] = pages.map((p) => ({ id: p.id, dataUrl: p.dataUrl }));
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-white">Review your scan</h1>

        {!online && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
            You&apos;re offline — this will save on your device and sync automatically once you&apos;re back online.
          </div>
        )}

        <PageStrip
          pages={stripPages}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setStage("review");
          }}
          onRemove={handleRemovePage}
          onAddPage={() => setStage("camera")}
        />

        <Input
          label="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={extractText}
            onChange={(e) => setExtractText(e.target.checked)}
            className="h-4 w-4 rounded accent-brand-500"
          />
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-300" />
            Extract text with OCR (makes the document searchable)
          </span>
        </label>

        <Button onClick={handleSave} fullWidth disabled={pages.length === 0}>
          Save document ({pages.length} page{pages.length === 1 ? "" : "s"})
        </Button>
      </div>
    );
  }

  if (stage === "saving") {
    return <ScannerLoading label={savingLabel} />;
  }

  if (stage === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-xl font-bold text-white">
          {savedOffline ? "Saved on this device" : "Document saved!"}
        </h1>
        <p className="text-sm text-slate-400">
          {savedOffline ? (
            <>
              &ldquo;{title}&rdquo; is saved locally — it&apos;ll upload to your
              account automatically the moment you&apos;re back online.
            </>
          ) : (
            <>&ldquo;{title}&rdquo; is now safely stored in your account, synced to every device.</>
          )}
        </p>
        <div className="flex w-full flex-col gap-2">
          <Button onClick={handleDownloadPdf} variant="secondary" fullWidth>
            <Download className="h-4 w-4" />
            Download as PDF
          </Button>
          <Button onClick={() => router.push("/dashboard")} fullWidth>
            Back to dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
