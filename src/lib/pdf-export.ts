import { PDFDocument } from "pdf-lib";

/** Combines JPEG data URLs (one per page) into a single downloadable PDF. */
export async function buildPdfFromImages(dataUrls: string[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const dataUrl of dataUrls) {
    const imageBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
    const jpg = await pdfDoc.embedJpg(imageBytes);
    const { width, height } = jpg.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(jpg, { x: 0, y: 0, width, height });
  }

  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

/** Converts a list of image files (JPEG or PNG) into a single downloadable PDF, one page each. */
export async function buildPdfFromImageFiles(files: File[]): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type === "image/png" ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

/** Merges multiple PDF files into one, in the order given. */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) mergedDoc.addPage(page);
  }

  const bytes = await mergedDoc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
