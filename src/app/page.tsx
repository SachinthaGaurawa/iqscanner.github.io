"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Cloud,
  FileStack,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Logo } from "@/components/Logo";
import { FeatureCard } from "@/components/FeatureCard";

const FEATURES = [
  {
    icon: ScanLine,
    title: "Intelligent Edge Detection",
    description:
      "Automatic border detection and perspective correction locks onto your document instantly, from any angle or lighting.",
  },
  {
    icon: Sparkles,
    title: "Studio-Grade OCR",
    description:
      "Extract crisp, searchable text from any scan with an OCR engine tuned for maximum real-world accuracy.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by Design",
    description:
      "Firebase Authentication and per-user Firestore rules keep every scan private and encrypted in transit.",
  },
  {
    icon: Cloud,
    title: "Free Cloud Sync",
    description:
      "Every document is safely stored in the cloud and available the moment you sign in on a new device.",
  },
  {
    icon: Smartphone,
    title: "Works on Every Screen",
    description:
      "A fully responsive, installable app that feels native on phones, tablets, and desktops alike.",
  },
  {
    icon: FileStack,
    title: "Zero Ads, Zero Limits",
    description:
      "No paywalls, no interstitials, no watermarks — the premium experience, free from day one.",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" />
      <div className="animate-float pointer-events-none absolute top-40 right-10 h-72 w-72 rounded-full bg-accent-500/10 blur-[100px]" />

      <NavBar />

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-10 text-center sm:pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <Logo size={72} animated />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-400" />
          Next-generation document scanning
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl"
        >
          Scan anything.
          <br />
          <span className="text-gradient">Perfectly accurate.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-balance text-base text-slate-400 sm:text-lg"
        >
          Quick Scanner turns your camera into a professional-grade document
          scanner — sharp edge detection, powerful OCR, and secure cloud
          storage. No ads. No premium wall. Ever.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-brand-500/50 hover:brightness-110"
          >
            Start scanning for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            I already have an account
          </Link>
        </motion.div>

        <p className="mt-4 text-xs text-slate-500">
          Sign up in seconds with email, Google, or continue as a guest.
        </p>
      </main>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="mb-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Everything CamScanner has. And what it doesn&apos;t.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Built from the ground up with the most capable scanning
            technology available — no compromises, no fine print.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} {...feature} />
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span>© {new Date().getFullYear()} Quick Scanner. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-slate-300">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-slate-300">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
