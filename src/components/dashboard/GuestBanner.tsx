"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Info, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleIcon } from "@/components/GoogleIcon";

export function GuestBanner() {
  const { upgradeGuestWithGoogle, upgradeGuestWithEmail } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"google" | "email" | null>(null);

  async function handleGoogle() {
    setSubmitting("google");
    try {
      await upgradeGuestWithGoogle();
      toast.success("Account saved with Google!");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleEmail(event: FormEvent) {
    event.preventDefault();
    setSubmitting("email");
    try {
      await upgradeGuestWithEmail(email, password, name);
      toast.success("Account saved!");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-200">
              You&apos;re browsing as a guest
            </p>
            <p className="mt-0.5 text-sm text-amber-100/70">
              Save an account so your scans are never lost if you sign out.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            onClick={handleGoogle}
            loading={submitting === "google"}
            className="!py-2 !text-xs"
          >
            <GoogleIcon className="h-3.5 w-3.5" />
            Link Google
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpanded((v) => !v)}
            className="!py-2 !text-xs"
          >
            Use email
          </Button>
        </div>
      </div>

      {expanded && (
        <form onSubmit={handleEmail} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="Name"
            icon={<User className="h-4 w-4" />}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            icon={<Lock className="h-4 w-4" />}
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="sm:col-span-3">
            <Button type="submit" loading={submitting === "email"}>
              Save account
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
