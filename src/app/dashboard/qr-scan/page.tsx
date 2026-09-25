"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Check, Copy, ExternalLink, QrCode, RotateCcw } from "lucide-react";
import { ScannerLoading } from "@/components/scanner/ScannerLoading";

interface ScanControls {
  stop: () => void;
}

const isLikelyUrl = (text: string) => /^https?:\/\//i.test(text.trim());

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScanControls | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let found = false;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        if (cancelled || !videoRef.current) return;
        setStatus("scanning");

        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current,
          (decoded) => {
            if (cancelled || found || !decoded) return;
            found = true;
            setResult(decoded.getText());
            controlsRef.current?.stop();
          },
        );
        controlsRef.current = controls;
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access and try again."
            : "Couldn't access the camera on this device.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanKey]);

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  function handleScanAgain() {
    setResult(null);
    setStatus("loading");
    setScanKey((k) => k + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {status === "error" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <QrCode className="h-10 w-10 text-slate-600" />
            <p className="max-w-sm text-sm text-slate-300">{errorMessage}</p>
            <button
              onClick={handleScanAgain}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black" style={{ aspectRatio: 1 }}>
              {status === "loading" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/80">
                  <ScannerLoading label="Starting camera…" compact />
                </div>
              )}
              <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
              {status === "scanning" && !result && (
                <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-brand-400/70" />
              )}
            </div>

            {!result ? (
              <p className="text-center text-xs text-slate-400">
                Point your camera at a QR code or barcode — it&apos;ll scan automatically.
              </p>
            ) : (
              <div className="w-full rounded-2xl border border-brand-400/20 bg-brand-500/[0.06] p-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-200">
                  <Check className="h-3.5 w-3.5" />
                  Scanned
                </div>
                <p className="mb-4 break-words text-sm leading-relaxed text-slate-100">{result}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                  {isLikelyUrl(result) && (
                    <a
                      href={result}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  )}
                </div>
                <button
                  onClick={handleScanAgain}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Scan again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
