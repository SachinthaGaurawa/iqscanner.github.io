"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, User, UserRound } from "lucide-react";
import { AuthShell, AuthDivider } from "@/components/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/GoogleIcon";
import { useAuth } from "@/lib/auth-context";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signUp, signInGoogle, signInGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState<"email" | "google" | "guest" | null>(null);

  useEffect(() => {
    if (!loading && user && !user.isAnonymous) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match.");
      return;
    }
    setConfirmError(undefined);
    setSubmitting("email");
    try {
      await signUp(email, password, name);
      toast.success("Account created — welcome to Quick Scanner!");
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
      toast.success("Welcome to Quick Scanner!");
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
    <AuthShell title="Create your account" subtitle="Free forever. No ads, no credit card.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          icon={<User className="h-4 w-4" />}
          placeholder="Jane Doe"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          error={confirmError}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" fullWidth loading={submitting === "email"}>
          Create account
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-300 hover:text-brand-200">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
