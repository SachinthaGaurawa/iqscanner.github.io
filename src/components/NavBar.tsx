import Link from "next/link";
import { Logo } from "@/components/Logo";

export function NavBar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={36} />
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Quick Scanner
        </span>
      </Link>
      <nav className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:shadow-brand-500/40 hover:brightness-110"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}
