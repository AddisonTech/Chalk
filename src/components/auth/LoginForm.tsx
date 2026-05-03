"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  searchParamsPromise: Promise<{ redirect?: string; error?: string; message?: string }>;
};

export function LoginForm({ searchParamsPromise }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Surface server-side messages from query string (e.g. after sign-out).
  useEffect(() => {
    searchParamsPromise.then((sp) => {
      if (sp.error) setError(sp.error);
      if (sp.message) setMessage(sp.message);
    });
  }, [searchParamsPromise]);

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const redirect = params.get("redirect") || "/";

    startTransition(async () => {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.replace(redirect);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
