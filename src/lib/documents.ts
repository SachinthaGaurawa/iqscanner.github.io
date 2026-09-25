"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface DocumentRecord {
  id: string;
  title: string;
  pageCount: number;
  pageUrls: string[];
  ocrText: string;
  sizeBytes: number;
  createdAt: Date | null;
}

interface NewPage {
  dataUrl: string;
  ocrText?: string;
}

function storagePath(uid: string, docId: string, pageIndex: number) {
  return `users/${uid}/documents/${docId}/page-${pageIndex + 1}.jpg`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocumentSnapshot(id: string, data: Record<string, any>): DocumentRecord {
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
  return {
    id,
    title: data.title ?? "Untitled",
    pageCount: data.pageCount ?? 0,
    pageUrls: data.pageUrls ?? [],
    ocrText: data.ocrText ?? "",
    sizeBytes: data.sizeBytes ?? 0,
    createdAt,
  };
}

export async function createDocument(
  uid: string,
  { title, pages }: { title: string; pages: NewPage[] },
): Promise<string> {
  const docRef = doc(collection(db, "documents"));
  const pageUrls: string[] = [];
  let sizeBytes = 0;

  for (let i = 0; i < pages.length; i++) {
    const blob = await fetch(pages[i].dataUrl).then((r) => r.blob());
    sizeBytes += blob.size;
    const storageRef = ref(storage, storagePath(uid, docRef.id, i));
    await uploadBytes(storageRef, blob, { contentType: "image/jpeg" });
    pageUrls.push(await getDownloadURL(storageRef));
  }

  const ocrText = pages
    .map((p) => p.ocrText?.trim())
    .filter(Boolean)
    .join("\n\n---\n\n");

  await setDoc(docRef, {
    ownerId: uid,
    title,
    pageCount: pages.length,
    pageUrls,
    ocrText,
    sizeBytes,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeToUserDocuments(
  uid: string,
  callback: (docs: DocumentRecord[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "documents"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((snap) => mapDocumentSnapshot(snap.id, snap.data())));
  });
}

export function subscribeToDocument(
  docId: string,
  callback: (doc: DocumentRecord | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "documents", docId), (snap) => {
    callback(snap.exists() ? mapDocumentSnapshot(snap.id, snap.data()) : null);
  });
}

export async function updateDocumentText(docId: string, ocrText: string): Promise<void> {
  await updateDoc(doc(db, "documents", docId), { ocrText });
}

export function useDocument(docId: string | undefined) {
  const [state, setState] = useState<{ id: string | null; record: DocumentRecord | null }>({
    id: null,
    record: null,
  });

  useEffect(() => {
    if (!docId) return;
    const unsubscribe = subscribeToDocument(docId, (record) => {
      setState({ id: docId, record });
    });
    return unsubscribe;
  }, [docId]);

  const loaded = Boolean(docId) && state.id === docId;
  return { record: loaded ? state.record : null, loading: Boolean(docId) && !loaded };
}

export async function deleteDocumentRecord(uid: string, record: DocumentRecord): Promise<void> {
  await Promise.all(
    record.pageUrls.map((_, i) =>
      deleteObject(ref(storage, storagePath(uid, record.id, i))).catch(() => undefined),
    ),
  );
  await deleteDoc(doc(db, "documents", record.id));
}

export function useUserDocuments(uid: string | undefined) {
  const [state, setState] = useState<{ uid: string | null; docs: DocumentRecord[] }>({
    uid: null,
    docs: [],
  });

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToUserDocuments(uid, (records) => {
      setState({ uid, docs: records });
    });
    return unsubscribe;
  }, [uid]);

  const loaded = Boolean(uid) && state.uid === uid;
  return { docs: loaded ? state.docs : [], loading: Boolean(uid) && !loaded };
}
