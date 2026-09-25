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
// How far a candidate's aspect ratio may drift from the target (log-scale)
// before it's rejected outright, e.g. 0.35 ~= up to ~1.42x off in either
// direction. Loose enough for a card held at a slight angle, tight enough to
// reject a table edge or a photo printed on the document itself.
const ASPECT_TOLERANCE = 0.35;

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

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function quadAspect(quad: Quad): number {
  const width = (dist(quad.topLeft, quad.topRight) + dist(quad.bottomLeft, quad.bottomRight)) / 2;
  const height = (dist(quad.topLeft, quad.bottomLeft) + dist(quad.topRight, quad.bottomRight)) / 2;
  return width / Math.max(height, 1);
}

/** Log-scale distance between a quad's proportions and the target (0 = perfect match). */
function aspectDeviation(quad: Quad, targetAspect: number): number {
  const candidate = quadAspect(quad);
  const diffA = Math.abs(Math.log(candidate / targetAspect));
  const diffB = Math.abs(Math.log(candidate / (1 / targetAspect)));
  return Math.min(diffA, diffB);
}

interface Candidate {
  quad: Quad;
  area: number;
}

/**
 * Classic scanner pipeline: grayscale -> blur -> Canny -> dilate -> contours.
 *
 * When `targetAspect` is given (e.g. an ID card or passport page's known
 * width/height ratio), candidates whose shape doesn't plausibly match it are
 * rejected outright rather than merely down-weighted — a table edge or a
 * photo printed on the card is often *larger* in the frame than the actual
 * document, so a soft area+aspect blend can still pick the wrong region. If
 * nothing passes the shape gate, detection falls back to the largest quad
 * overall so the user still gets a live outline to align against.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function detectDocumentQuad(cv: Cv, srcMat: any, targetAspect?: number): Quad | null {
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const edged = new cv.Mat();
  const dilated = new cv.Mat();
  const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  const candidates: Candidate[] = [];

  try {
    cv.cvtColor(srcMat, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edged, 50, 150);
    cv.dilate(edged, dilated, kernel);
    cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    const frameArea = srcMat.rows * srcMat.cols;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      const peri = cv.arcLength(contour, true);
      const approx = new cv.Mat();
      cv.approxPolyDP(contour, approx, 0.02 * peri, true);

      if (approx.rows === 4) {
        const area = Math.abs(cv.contourArea(approx));
        if (area > frameArea * MIN_AREA_RATIO) {
          const pts: Point[] = [];
          for (let j = 0; j < 4; j++) {
            pts.push({ x: approx.data32S[j * 2], y: approx.data32S[j * 2 + 1] });
          }
          candidates.push({ quad: orderPoints(pts), area });
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

  if (candidates.length === 0) return null;

  if (targetAspect) {
    const shapeMatched = candidates.filter((c) => aspectDeviation(c.quad, targetAspect) <= ASPECT_TOLERANCE);
    const pool = shapeMatched.length > 0 ? shapeMatched : candidates;
    return pool.reduce((best, c) => (c.area > best.area ? c : best)).quad;
  }

  return candidates.reduce((best, c) => (c.area > best.area ? c : best)).quad;
}
