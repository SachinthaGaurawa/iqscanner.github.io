import type { Cv } from "./opencv";

export interface Point {
  x: number;
  y: number;
}

export interface Quad {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

const MIN_AREA_RATIO = 0.15;

function orderPoints(pts: Point[]): Quad {
  const bySum = [...pts].sort((a, b) => a.x + a.y - (b.x + b.y));
  const byDiff = [...pts].sort((a, b) => a.x - a.y - (b.x - b.y));
  return {
    topLeft: bySum[0],
    bottomRight: bySum[3],
    topRight: byDiff[3],
    bottomLeft: byDiff[0],
  };
}

/**
 * Classic scanner pipeline: grayscale -> blur -> Canny -> dilate -> contours.
 * Picks the largest 4-point contour that plausibly covers a sheet of paper,
 * ignoring small/noisy contours below MIN_AREA_RATIO of the frame.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detectDocumentQuad(cv: Cv, srcMat: any): Quad | null {
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edged = new cv.Mat();
  const dilated = new cv.Mat();
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  let bestQuad: Quad | null = null;

  try {
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edged, 50, 150);
    cv.dilate(edged, dilated, kernel);
    cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    const frameArea = srcMat.rows * srcMat.cols;
    let bestArea = 0;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const peri = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        const area = Math.abs(cv.contourArea(approx));
        if (area > bestArea && area > frameArea * MIN_AREA_RATIO) {
          const pts: Point[] = [];
          for (let j = 0; j < 4; j++) {
            pts.push({ x: approx.data32S[j * 2], y: approx.data32S[j * 2 + 1] });
          }
          bestArea = area;
          bestQuad = orderPoints(pts);
        }
      }
      approx.delete();
      contour.delete();
    }
  } finally {
    gray.delete();
    blurred.delete();
    edged.delete();
    dilated.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();
  }

  return bestQuad;
}
