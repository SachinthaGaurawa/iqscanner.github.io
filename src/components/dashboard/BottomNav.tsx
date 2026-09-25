"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { FolderOpen, Home, User, Wrench } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/files", label: "My Files", icon: FolderOpen },
  { href: "/dashboard/tools", label: "Tools", icon: Wrench },
  { href: "/dashboard/me", label: "Me", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink-950/90 backdrop-blur-lg">
      <div
        className="mx-auto flex max-w-lg items-stretch justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((tab) => {
          const active = tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-400"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={clsx(
                  "h-5 w-5 transition-colors",
                  active ? "text-brand-300" : "text-slate-500",
                )}
              />
              <span
                className={clsx(
                  "text-[11px] font-medium transition-colors",
                  active ? "text-brand-200" : "text-slate-500",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
