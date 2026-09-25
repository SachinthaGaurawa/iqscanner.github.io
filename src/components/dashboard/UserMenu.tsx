"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";

export function UserMenu() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const label = user.isAnonymous ? "Guest" : user.displayName || user.email || "Account";
  const initial = label.charAt(0).toUpperCase();

  async function handleSignOut() {
    await logOut();
    toast.success("Signed out");
    router.push("/");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/[0.06]"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
            {user.isAnonymous ? <UserRound className="h-4 w-4" /> : initial}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-200 sm:block">
          {label}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/40">
          <div className="border-b border-white/5 px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{label}</p>
            {!user.isAnonymous && user.email && (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
