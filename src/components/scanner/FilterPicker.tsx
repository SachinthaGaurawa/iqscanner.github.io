"use client";

import clsx from "clsx";
import { FILTERS, type FilterId } from "@/lib/scanner/filters";

export function FilterPicker({
  value,
  onChange,
  previews,
}: {
  value: FilterId;
  onChange: (filter: FilterId) => void;
  previews: Partial<Record<FilterId, string>>;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto px-1 pb-1">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className="flex shrink-0 flex-col items-center gap-1.5"
        >
          <span
            className={clsx(
              "h-16 w-16 overflow-hidden rounded-xl border-2 bg-ink-800 bg-cover bg-center transition-colors",
              value === filter.id ? "border-brand-400" : "border-white/10",
            )}
            style={previews[filter.id] ? { backgroundImage: `url(${previews[filter.id]})` } : undefined}
          />
          <span
            className={clsx(
              "text-xs font-medium",
              value === filter.id ? "text-white" : "text-slate-400",
            )}
          >
            {filter.label}
          </span>
        </button>
      ))}
    </div>
  );
}
