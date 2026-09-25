import { isSupported, getAnalytics } from "firebase/analytics";
import { firebaseApp } from "@/lib/firebase";

let initialized = false;

/** Lazily boots Firebase Analytics in the browser only, when supported. */
export async function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return;
  if (await isSupported()) {
    getAnalytics(firebaseApp);
    initialized = true;
  }
}
