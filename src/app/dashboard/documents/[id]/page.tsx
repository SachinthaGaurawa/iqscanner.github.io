"use client";

import { use, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Languages,
  Loader2,
  Save,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDocument, updateDocumentText } from "@/lib/documents";
import { buildPdfFromImages, downloadBlob } from "@/lib/pdf-export";
import { translateText, TRANSLATE_LANGUAGES } from "@/lib/translate";
import { Button } from "@/components/ui/Button";
import { ScannerLoading } from "@/components/scanner/ScannerLoading";

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { record, loading } = useDocument(id);

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [targetLang, setTargetLang] = useState<string>(TRANSLATE_LANGUAGES[0].code);
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Seed the editable text from the loaded document, once per document —
  // done during render (not an Effect) so it takes effect before paint,
  // per https://react.dev/learn/you-might-not-need-an-effect.
  if (record && loadedFor !== record.id) {
    setLoadedFor(record.id);
    setText(record.ocrText);
    setDirty(false);
    setTranslated(null);
  }

  if (loading) return <ScannerLoading label="Loading document…" />;

  if (!record) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <p className="text-slate-300">This document doesn&apos;t exist or isn&apos;t yours.</p>
        <Link href="/dashboard" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
          Back to dashboard
        </Link>
      </div>
    );
  }

  async function handleSaveText() {
    setSaving(true);
    try {
      await updateDocumentText(id, text);
      setDirty(false);
      toast.success("Text updated");
    } catch {
      toast.error("Couldn't save your edits.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  async function handleTranslate() {
    if (!text.trim()) {
      toast.error("There's no text to translate yet.");
      return;
    }
    setTranslating(true);
    try {
      const result = await translateText(text, targetLang);
      setTranslated(result);
    } catch {
      toast.error("Translation is unavailable right now — please try again shortly.");
    } finally {
      setTranslating(false);
    }
  }

  async function handleDownloadPdf() {
    try {
      const blob = await buildPdfFromImages(record!.pageUrls);
      downloadBlob(blob, `${record!.title || "scan"}.pdf`);
    } catch {
      toast.error("Couldn't build the PDF.");
    }
  }

  async function handleDownloadImage(url: string, index: number) {
    try {
      const blob = await fetch(url).then((r) => r.blob());
      const objectUrl = URL.createObjectURL(blob);
      downloadBlob(blob, `${record!.title || "scan"}-page-${index + 1}.jpg`);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Couldn't download that page.");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <Button onClick={handleDownloadPdf} variant="secondary" className="!py-2 !text-xs">
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </Button>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold text-white">{record.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {record.pageCount} page{record.pageCount === 1 ? "" : "s"}
          {record.createdAt ? ` · ${record.createdAt.toLocaleDateString()}` : ""}
          {user?.uid ? "" : ""}
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {record.pageUrls.map((url, i) => (
          <div key={url} className="group relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Page ${i + 1}`}
              className="h-40 w-auto rounded-xl border border-white/10 object-cover"
            />
            <button
              onClick={() => handleDownloadImage(url, i)}
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
              aria-label={`Download page ${i + 1} as image`}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Extracted text
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(text)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
            <Button onClick={handleSaveText} disabled={!dirty || saving} className="!px-3 !py-1.5 !text-xs">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : dirty ? (
                <Save className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {dirty ? "Save" : "Saved"}
            </Button>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          rows={10}
          placeholder="No text was extracted for this document yet."
          className="w-full resize-y rounded-xl border border-white/10 bg-ink-800/60 p-4 text-sm leading-relaxed text-white placeholder:text-slate-500 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
        />

        <div className="mt-5 border-t border-white/5 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Languages className="h-4 w-4 text-brand-300" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-white outline-none focus:border-brand-400"
            >
              {TRANSLATE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleTranslate}
              disabled={translating}
              loading={translating}
              variant="secondary"
              className="!px-4 !py-2 !text-sm"
            >
              Translate
            </Button>
          </div>

          {translated !== null && (
            <div className="mt-4 rounded-xl border border-brand-400/20 bg-brand-500/[0.06] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-200">
                  Translation
                </span>
                <button
                  onClick={() => handleCopy(translated)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-200 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                {translated || "—"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
