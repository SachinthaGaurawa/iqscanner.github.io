"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpen, IdCard, QrCode, ScanText, Stamp, TextSearch, type LucideIcon } from "lucide-react";

interface ScanOption {
  href: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
}

const OPTIONS: ScanOption[] = [
  {
    href: "/dashboard/scan?mode=smart",
    label: "Smart Scan",
    icon: ScanText,
    gradient: "from-brand-500 to-accent-500",
  },
  {
    href: "/dashboard/scan?mode=id",
    label: "ID Card",
    icon: IdCard,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    href: "/dashboard/scan?mode=passport",
    label: "Passport",
    icon: Stamp,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    href: "/dashboard/scan?mode=book",
    label: "Book",
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    href: "/dashboard/scan?mode=ocr",
    label: "OCR Extract Text",
    icon: TextSearch,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/dashboard/qr-scan",
    label: "QR / Barcode",
    icon: QrCode,
    gradient: "from-rose-500 to-pink-600",
  },
];

export function ScanOptionsGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {OPTIONS.map((option, index) => (
        <motion.div
          key={option.href}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <Link href={option.href} className="group block">
            <motion.div
              whileTap={{ scale: 0.94 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-4 text-center transition-colors group-hover:border-white/20 group-hover:bg-white/[0.06]"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.gradient} shadow-lg shadow-black/20`}
              >
                <option.icon className="h-6 w-6 text-white" />
              </span>
              <span className="text-xs font-medium leading-tight text-slate-200">
                {option.label}
              </span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
