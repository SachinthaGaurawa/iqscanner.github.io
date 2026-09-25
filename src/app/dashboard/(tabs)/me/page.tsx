"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { LogOut, Shield, Sparkles, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GuestBanner } from "@/components/dashboard/GuestBanner";

export default function MePage() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!user) return null;

  const name = user.isAnonymous
    ? "Guest"
    : (user.displayName ?? user.email?.split("@")[0] ?? "Account");

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Couldn't sign out — please try again.");
      setSigningOut(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="mb-6 font-display text-2xl font-bold text-white">Me</h1>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl font-bold text-white">
            {user.isAnonymous ? <UserRound className="h-7 w-7" /> : name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-white">{name}</p>
          {!user.isAnonymous && user.email && (
            <p className="truncate text-sm text-slate-400">{user.email}</p>
          )}
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-200">
            <Sparkles className="h-3 w-3" />
            Premium — Free forever
          </span>
        </div>
      </div>

      {user.isAnonymous && <GuestBanner />}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4 text-sm text-slate-300">
          <Shield className="h-4 w-4 text-slate-500" />
          Your documents are private — only you can see them.
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/5 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-slate-600">Quick Scanner · v1.0</p>
    </motion.div>
  );
}
