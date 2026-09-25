// Tesseract.js is only ever pulled in when OCR is actually requested — it
// fetches its own WASM core + language data lazily, so this stays cheap
// until a user opts into text extraction for a scanned page.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = import("tesseract.js").then(({ createWorker }) =>
      createWorker("eng"),
    );
  }
  return workerPromise;
}

/** Extracts text from an image (data URL, canvas, or blob). Lazily boots the OCR engine. */
export async function recognizeText(image: string | HTMLCanvasElement | Blob): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(image);
  return text.trim();
}

export async function disposeOcr() {
  if (!workerPromise) return;
  const worker = await workerPromise;
  await worker.terminate();
  workerPromise = null;
}
