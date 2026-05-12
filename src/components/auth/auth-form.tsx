"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
          return;
        }
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!signUpData.session) {
        setError("Check your email to confirm your account, then sign in.");
        setMode("login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={
            mode === "login"
              ? "text-foreground"
              : "text-muted hover:text-muted-foreground"
          }
        >
          Sign in
        </button>
        <span className="text-muted">/</span>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={
            mode === "register"
              ? "text-foreground"
              : "text-muted hover:text-muted-foreground"
          }
        >
          Create account
        </button>
      </div>

      {mode === "register" && (
        <Field label="Full name">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Email">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
        />
      </Field>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending
          ? "Working..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
