// A4 at ~150dpi.
const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Lays the front and back of an ID card out on one A4 page, front on top. */
export async function composeIdCardPage(frontDataUrl: string, backDataUrl: string): Promise<string> {
  const [front, back] = await Promise.all([loadImage(frontDataUrl), loadImage(backDataUrl)]);

  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = 60;
  const gap = 40;
  const slotWidth = canvas.width - margin * 2;
  const slotHeight = (canvas.height - margin * 2 - gap) / 2;

  drawFitted(ctx, front, margin, margin, slotWidth, slotHeight);
  drawFitted(ctx, back, margin, margin + slotHeight + gap, slotWidth, slotHeight);

  return canvas.toDataURL("image/jpeg", 0.92);
}
