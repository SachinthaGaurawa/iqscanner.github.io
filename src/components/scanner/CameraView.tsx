"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { loadOpenCv, type Cv } from "@/lib/scanner/opencv";
import { detectDocumentQuad, type Quad } from "@/lib/scanner/detect";
import { warpDocument } from "@/lib/scanner/warp";
import { matToDataUrl } from "@/lib/scanner/mat-utils";
import { playShutterSound } from "@/lib/scanner/sound";
import { ShutterButton } from "@/components/scanner/ShutterButton";
import { ScannerLoading } from "@/components/scanner/ScannerLoading";

const DETECT_INTERVAL_MS = 220;
const PROC_WIDTH = 480;

export interface CaptureResult {
  dataUrl: string;
  autoDetected: boolean;
}

interface CameraViewProps {
  onCapture: (result: CaptureResult) => void;
  onCancel: () => void;
  instruction?: string;
}

export function CameraView({
  onCapture,
  onCancel,
  instruction = "Line the document up inside the frame — the green outline locks on automatically.",
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cvRef = useRef<Cv | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const quadRef = useRef<Quad | null>(null);
  const processingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<"loading-cv" | "requesting-camera" | "ready" | "error">(
    "loading-cv",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [aspect, setAspect] = useState(3 / 4);
  const [flash, setFlash] = useState(false);

  const drawOverlay = useCallback((quad: Quad | null) => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!quad) return;

    const pts = [quad.topLeft, quad.topRight, quad.bottomRight, quad.bottomLeft];
    ctx.lineWidth = Math.max(3, canvas.width * 0.006);
    ctx.strokeStyle = "rgba(163, 230, 53, 0.95)";
    ctx.fillStyle = "rgba(163, 230, 53, 0.15)";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(163, 230, 53, 1)";
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(5, canvas.width * 0.01), 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const runDetection = useCallback(() => {
    const cv = cvRef.current;
    const video = videoRef.current;
    if (!cv || !video || processingRef.current || video.readyState < 2) return;
    processingRef.current = true;

    try {
      if (!procCanvasRef.current) {
        procCanvasRef.current = document.createElement("canvas");
      }
      const proc = procCanvasRef.current;
      const scale = PROC_WIDTH / video.videoWidth;
      proc.width = PROC_WIDTH;
      proc.height = Math.round(video.videoHeight * scale);

      const ctx = proc.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, proc.width, proc.height);

      const srcMat = cv.imread(proc);
      const quad = detectDocumentQuad(cv, srcMat);
      srcMat.delete();

      if (quad) {
        const upscale = video.videoWidth / PROC_WIDTH;
        const scaled: Quad = {
          topLeft: { x: quad.topLeft.x * upscale, y: quad.topLeft.y * upscale },
          topRight: { x: quad.topRight.x * upscale, y: quad.topRight.y * upscale },
          bottomRight: { x: quad.bottomRight.x * upscale, y: quad.bottomRight.y * upscale },
          bottomLeft: { x: quad.bottomLeft.x * upscale, y: quad.bottomLeft.y * upscale },
        };
        quadRef.current = scaled;
        drawOverlay(scaled);
      } else {
        quadRef.current = null;
        drawOverlay(null);
      }
    } finally {
      processingRef.current = false;
    }
  }, [drawOverlay]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const cv = await loadOpenCv();
        if (cancelled) return;
        cvRef.current = cv;
        setStatus("requesting-camera");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const onMeta = () => {
          setAspect(video.videoWidth / video.videoHeight);
          if (overlayRef.current) {
            overlayRef.current.width = video.videoWidth;
            overlayRef.current.height = video.videoHeight;
          }
        };
        video.addEventListener("loadedmetadata", onMeta, { once: true });
        if (video.videoWidth) onMeta();

        setStatus("ready");
        intervalRef.current = setInterval(runDetection, DETECT_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in your browser settings and try again."
            : "Couldn't access the camera on this device.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShutter() {
    const cv = cvRef.current;
    const video = videoRef.current;
    if (!cv || !video) return;

    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    playShutterSound();

    const full = document.createElement("canvas");
    full.width = video.videoWidth;
    full.height = video.videoHeight;
    const ctx = full.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, full.width, full.height);

    const srcMat = cv.imread(full);
    const quad = quadRef.current;
    let outputMat = srcMat;
    let cropped = false;

    if (quad) {
      try {
        outputMat = warpDocument(cv, srcMat, quad);
        cropped = true;
      } catch {
        outputMat = srcMat;
      }
    }

    const dataUrl = matToDataUrl(cv, outputMat);
    srcMat.delete();
    if (cropped) outputMat.delete();

    onCapture({ dataUrl, autoDetected: cropped });
  }

  if (status === "loading-cv") {
    return <ScannerLoading label="Loading the scan engine…" />;
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="max-w-sm text-sm text-slate-300">{errorMessage}</p>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          <RotateCcw className="h-4 w-4" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-6">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl"
        style={{ aspectRatio: aspect }}
      >
        {status === "requesting-camera" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink-950/80">
            <ScannerLoading label="Starting camera…" compact />
          </div>
        )}
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full" />
        <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-white"
            />
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-slate-400">{instruction}</p>

      <div className="flex items-center gap-8">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-400 hover:text-white"
        >
          Cancel
        </button>
        <ShutterButton onPress={handleShutter} disabled={status !== "ready"} />
        <div className="w-10" />
      </div>
    </div>
  );
}
