import type { Cv } from "./opencv";

export type FilterId = "original" | "magic" | "grayscale" | "bw";

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "magic", label: "Magic Color" },
  { id: "grayscale", label: "Grayscale" },
  { id: "bw", label: "Black & White" },
];

/** Returns a NEW Mat with the filter applied — caller owns and must delete it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyFilter(cv: Cv, srcMat: any, filter: FilterId): any {
  if (filter === "grayscale") {
    const gray = new cv.Mat();
    const out = new cv.Mat();
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(gray, out, cv.COLOR_GRAY2RGBA);
    gray.delete();
    return out;
  }

  if (filter === "bw") {
    const gray = new cv.Mat();
    const thresh = new cv.Mat();
    const out = new cv.Mat();
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
    cv.adaptiveThreshold(
      gray,
      thresh,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      35,
      15,
    );
    cv.cvtColor(thresh, out, cv.COLOR_GRAY2RGBA);
    gray.delete();
    thresh.delete();
    return out;
  }

  if (filter === "magic") {
    // Punchy contrast + brightness lift so printed/handwritten text pops,
    // approximating the "Magic Color" enhancement mode of dedicated scanner apps.
    const out = new cv.Mat();
    srcMat.convertTo(out, -1, 1.28, 10);
    return out;
  }

  return srcMat.clone();
}
