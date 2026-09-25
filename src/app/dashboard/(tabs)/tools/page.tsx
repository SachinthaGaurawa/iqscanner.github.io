"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight, QrCode } from "lucide-react";
import { ImagesToPdfTool } from "@/components/tools/ImagesToPdfTool";
import { MergePdfsTool } from "@/components/tools/MergePdfsTool";
import { CombineScansTool } from "@/components/tools/CombineScansTool";

export default function ToolsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Tools</h1>

      <Link
        href="/dashboard/qr-scan"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-600/20 text-rose-300">
          <QrCode className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-sm font-bold text-white">Scan QR / Barcode</h3>
          <p className="text-xs text-slate-500">Read any QR code or barcode with your camera.</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
      </Link>

      <ImagesToPdfTool />
      <MergePdfsTool />
      <CombineScansTool />
    </motion.div>
  );
}
