"use client";

import { useEffect, useState } from "react";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface PendingPage {
  dataUrl: string;
  ocrText?: string;
}

export interface PendingDocument {
  id: string;
  ownerId: string;
  title: string;
  pages: PendingPage[];
  createdAt: number;
}

interface OfflineDB extends DBSchema {
  "pending-documents": {
    key: string;
    value: PendingDocument;
    indexes: { ownerId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

const listeners = new Set<() => void>();

/** Lets UI hooks react immediately when the pending queue changes, without polling. */
export function subscribeToPendingChanges(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyChange() {
  for (const listener of listeners) listener();
}

function getDb() {
  if (typeof window === "undefined") {
    throw new Error("Offline storage is only available in the browser");
  }
  dbPromise ??= openDB<OfflineDB>("quick-scanner-offline", 1, {
    upgrade(db) {
      const store = db.createObjectStore("pending-documents", { keyPath: "id" });
      store.createIndex("ownerId", "ownerId");
    },
  });
  return dbPromise;
}

export async function addPendingDocument(doc: PendingDocument): Promise<void> {
  const db = await getDb();
  await db.put("pending-documents", doc);
  notifyChange();
}

export async function getPendingDocuments(ownerId: string): Promise<PendingDocument[]> {
  const db = await getDb();
  return db.getAllFromIndex("pending-documents", "ownerId", ownerId);
}

export async function removePendingDocument(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("pending-documents", id);
  notifyChange();
}

export function usePendingDocuments(ownerId: string | undefined) {
  const [state, setState] = useState<{ ownerId: string | null; docs: PendingDocument[] }>({
    ownerId: null,
    docs: [],
  });

  useEffect(() => {
    if (!ownerId) return;
    let cancelled = false;
    const refresh = () => {
      void getPendingDocuments(ownerId).then((records) => {
        if (!cancelled) setState({ ownerId, docs: records });
      });
    };
    refresh();
    const unsubscribe = subscribeToPendingChanges(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ownerId]);

  return ownerId && state.ownerId === ownerId ? state.docs : [];
}
