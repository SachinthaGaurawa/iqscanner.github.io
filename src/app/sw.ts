import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Tesseract.js fetches its OCR engine (worker/core/language data) from a CDN
// on first use. Cache it so repeat OCR runs — including offline ones — don't
// need to re-download it.
const ocrEngineCache: RuntimeCaching = {
  matcher: ({ url }) =>
    url.hostname === "cdn.jsdelivr.net" || url.hostname === "tessdata.projectnaptha.com",
  handler: new CacheFirst({
    cacheName: "ocr-engine",
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 90 })],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [ocrEngineCache, ...defaultCache],
});

serwist.addEventListeners();
