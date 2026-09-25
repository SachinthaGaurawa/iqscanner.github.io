"use client";

import { useAuth } from "@/lib/auth-context";
import { useAutoSync } from "@/lib/sync";

/** Invisible app-wide manager: retries queued offline scans whenever signed in or reconnected. */
export function SyncManager() {
  const { user } = useAuth();
  useAutoSync(user?.uid);
  return null;
}
