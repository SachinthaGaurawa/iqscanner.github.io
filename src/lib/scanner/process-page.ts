import type { Cv } from "./opencv";
import { loadImageMat, matToDataUrl } from "./mat-utils";
import { applyFilter, FILTERS, type FilterId } from "./filters";

/** Small, fast filter swatches for the picker UI. */
export async function computeFilterPreviews(
  cv: Cv,
  dataUrl: string,
): Promise<Partial<Record<FilterId, string>>> {
  const mat = await loadImageMat(cv, dataUrl, 160);
  const previews: Partial<Record<FilterId, string>> = {};
  try {
    for (const f of FILTERS) {
      const out = applyFilter(cv, mat, f.id);
      previews[f.id] = matToDataUrl(cv, out, 0.7);
      out.delete();
    }
  } finally {
    mat.delete();
  }
  return previews;
}

/** Applies a filter at full resolution — always re-derives from the original capture. */
export async function applyFilterToImage(
  cv: Cv,
  dataUrl: string,
  filter: FilterId,
): Promise<string> {
  const mat = await loadImageMat(cv, dataUrl);
  const out = applyFilter(cv, mat, filter);
  try {
    return matToDataUrl(cv, out, 0.92);
  } finally {
    mat.delete();
    out.delete();
  }
}
