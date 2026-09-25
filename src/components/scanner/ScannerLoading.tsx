import { Loader2 } from "lucide-react";

export function ScannerLoading({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-3 text-slate-300"
          : "flex min-h-[70vh] flex-col items-center justify-center gap-4 text-slate-300"
      }
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
