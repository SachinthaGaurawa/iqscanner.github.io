"use client";

import { useEffect } from "react";
import { createDocument } from "@/lib/documents";
import { getPendingDocuments, removePendingDocument } from "@/lib/offline-store";

// Several triggers (mount, 'online' event, a page revisit) can fire around
// the same moment. Without this, they'd race and could each try to upload
// the same queued document, risking duplicate documents in Firestore.
const inFlight = new Map<string, Promise<number>>();

/** Uploads every locally-queued document for this user, leaving failures queued for next time. */
export function syncPendingDocuments(uid: string): Promise<number> {
  const existing = inFlight.get(uid);
  if (existing) return existing;

  const run = runSync(uid).finally(() => inFlight.delete(uid));
  inFlight.set(uid, run);
  return run;
}

async function runSync(uid: string): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const pending = await getPendingDocuments(uid);
  let synced = 0;
  for (const doc of pending) {
    try {
      await createDocument(uid, { title: doc.title, pages: doc.pages });
      await removePendingDocument(doc.id);
      synced++;
    } catch {
      // Network or Firebase hiccup — leave it queued, retry next time.
    }
  }
  return synced;
}

/** Auto-syncs the offline queue whenever the app loads signed in, or connectivity returns. */
export function useAutoSync(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;
    void syncPendingDocuments(uid);
    const handleOnline = () => void syncPendingDocuments(uid);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [uid]);
}
