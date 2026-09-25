// Thin, cached loader around @techstark/opencv-js. The package ships a ~14MB
// Emscripten build, so it must only ever be pulled in via dynamic import from
// client code that actually needs it (the scanner route) — never imported at
// module scope, or it would bloat every page's bundle.
//
// The upstream type declarations lag behind the actual WASM runtime API, so
// this boundary is intentionally typed as `any` rather than fought with casts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Cv = any;

let cvPromise: Promise<Cv> | null = null;

export function loadOpenCv(): Promise<Cv> {
  if (typeof window === "undefined") {
    throw new Error("OpenCV can only be loaded in the browser");
  }
  if (!cvPromise) {
    cvPromise = import("@techstark/opencv-js").then((mod) => {
      const cvModule: Cv = (mod as { default?: unknown }).default ?? mod;
      if (cvModule instanceof Promise) {
        return cvModule;
      }
      if (cvModule.Mat) {
        return cvModule;
      }
      return new Promise<Cv>((resolve) => {
        cvModule.onRuntimeInitialized = () => resolve(cvModule);
      });
    });
  }
  return cvPromise;
}
