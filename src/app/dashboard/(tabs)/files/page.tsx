"use client";

import { motion } from "motion/react";
import { FolderOpen, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUserDocuments } from "@/lib/documents";
import { usePendingDocuments } from "@/lib/offline-store";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { PendingDocumentCard } from "@/components/dashboard/PendingDocumentCard";

export default function FilesPage() {
  const { user } = useAuth();
  const { docs, loading } = useUserDocuments(user?.uid);
  const pendingDocs = usePendingDocuments(user?.uid);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="mb-6 font-display text-2xl font-bold text-white">My Files</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : docs.length === 0 && pendingDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <FolderOpen className="mb-3 h-9 w-9 text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No documents yet</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Scan your first document from the Home tab and it will show up
            here, synced instantly across all your devices.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pendingDocs.map((doc) => (
            <PendingDocumentCard key={doc.id} doc={doc} />
          ))}
          {docs.map((record) => (
            <DocumentCard key={record.id} uid={user.uid} record={record} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
