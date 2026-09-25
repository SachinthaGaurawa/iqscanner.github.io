import type { Cv } from "./opencv";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function matToDataUrl(cv: Cv, mat: any, quality = 0.92): string {
  const canvas = document.createElement("canvas");
  cv.imshow(canvas, mat);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Loads a data URL into an OpenCV Mat, optionally downscaled to `maxWidth`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadImageMat(cv: Cv, dataUrl: string, maxWidth?: number): Promise<any> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  const scale = maxWidth && img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return cv.imread(canvas);
}
