"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { LEVELS, LEVEL_LABELS, ROLE_LABELS, COACH_ROLES } from "@/types/football";

type Mode = "login" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<(typeof COACH_ROLES)[number]>("coordinator");
  const [teamName, setTeamName] = useState("");
  const [school, setSchool] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("high_school");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setError("Check your email to confirm your account, then sign in.");
        setMode("login");
        return;
      }

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({ name: teamName, school, level })
        .select("id")
        .single();

      if (teamError || !team) {
        setError(teamError?.message ?? "Could not create team");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        team_id: team.id,
        full_name: fullName,
        role,
      });

      if (profileError) {
        setError(profileError.message);
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
        <>
          <Field label="Full name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Team name">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </Field>
            <Field label="School">
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <SelectBox
                value={role}
                onChange={(v) => setRole(v as typeof role)}
                options={COACH_ROLES.map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r],
                }))}
              />
            </Field>
            <Field label="Level">
              <SelectBox
                value={level}
                onChange={(v) => setLevel(v as typeof level)}
                options={LEVELS.map((l) => ({
                  value: l,
                  label: LEVEL_LABELS[l],
                }))}
              />
            </Field>
          </div>
        </>
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
          ? "Working…"
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

function SelectBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
