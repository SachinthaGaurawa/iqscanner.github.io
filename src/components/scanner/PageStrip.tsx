"use client";

import { Plus, X } from "lucide-react";

export interface ScannedPage {
  id: string;
  dataUrl: string;
}

export function PageStrip({
  pages,
  activeId,
  onSelect,
  onRemove,
  onAddPage,
}: {
  pages: ScannedPage[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddPage: () => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto px-1 pb-1">
      {pages.map((page, index) => (
        <div key={page.id} className="relative shrink-0">
          <button
            onClick={() => onSelect(page.id)}
            className={`h-20 w-16 overflow-hidden rounded-lg border-2 bg-cover bg-center transition-colors ${
              activeId === page.id ? "border-brand-400" : "border-white/10"
            }`}
            style={{ backgroundImage: `url(${page.dataUrl})` }}
            aria-label={`Page ${index + 1}`}
          />
          <span className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-[10px] font-bold text-white ring-1 ring-white/20">
            {index + 1}
          </span>
          <button
            onClick={() => onRemove(page.id)}
            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
            aria-label={`Remove page ${index + 1}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        onClick={onAddPage}
        className="flex h-20 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-white/20 text-slate-400 hover:border-brand-400 hover:text-brand-300"
      >
        <Plus className="h-5 w-5" />
        <span className="text-[10px] font-medium">Add</span>
      </button>
    </div>
  );
}
