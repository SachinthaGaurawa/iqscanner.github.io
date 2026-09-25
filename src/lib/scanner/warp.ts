import type { Cv } from "./opencv";
import type { Point, Quad } from "./detect";

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Straightens the quad found by detectDocumentQuad into a flat, cropped page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function warpDocument(cv: Cv, srcMat: any, quad: Quad): any {
  const { topLeft, topRight, bottomRight, bottomLeft } = quad;

  const maxWidth = Math.round(
    Math.max(distance(topLeft, topRight), distance(bottomLeft, bottomRight)),
  );
  const maxHeight = Math.round(
    Math.max(distance(topLeft, bottomLeft), distance(topRight, bottomRight)),
  );

  const srcQuad = cv.matFromArray(4, 1, cv.CV_32FC2, [
    topLeft.x,
    topLeft.y,
    topRight.x,
    topRight.y,
    bottomRight.x,
    bottomRight.y,
    bottomLeft.x,
    bottomLeft.y,
  ]);
  const dstQuad = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    maxWidth,
    0,
    maxWidth,
    maxHeight,
    0,
    maxHeight,
  ]);

  const transform = cv.getPerspectiveTransform(srcQuad, dstQuad);
  const dst = new cv.Mat();
  const dsize = new cv.Size(maxWidth, maxHeight);

  cv.warpPerspective(
    srcMat,
    dst,
    transform,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar(255, 255, 255, 255),
  );

  srcQuad.delete();
  dstQuad.delete();
  transform.delete();

  return dst;
}
