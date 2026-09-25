import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function ToolCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-1 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-accent-500/20 text-brand-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="font-display text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="mb-4 text-xs text-slate-500">{description}</p>
      {children}
    </div>
  );
}
