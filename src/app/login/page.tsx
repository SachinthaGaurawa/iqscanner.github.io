"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, UserRound } from "lucide-react";
import { AuthShell, AuthDivider } from "@/components/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useAuth } from "@/lib/auth-context";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signIn, signInGoogle, signInGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState<"email" | "google" | "guest" | null>(null);

  useEffect(() => {
    if (!loading && user && !user.isAnonymous) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting("email");
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleGoogle() {
    setSubmitting("google");
    try {
      await signInGoogle();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  }

  async function handleGuest() {
    setSubmitting("guest");
    try {
      await signInGuest();
      toast.success("Continuing as guest");
      router.push("/dashboard");
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your scanned documents">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth loading={submitting === "email"}>
          Sign in
        </Button>
      </form>

      <AuthDivider />

      <div className="flex flex-col gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={handleGoogle}
          loading={submitting === "google"}
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={handleGuest}
          loading={submitting === "guest"}
        >
          <UserRound className="h-4 w-4" />
          Continue as guest
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-300 hover:text-brand-200">
          Sign up for free
        </Link>
      </p>
    </AuthShell>
  );
}
