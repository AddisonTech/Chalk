"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function startDemoSession(): Promise<{ error: string } | never> {
  const admin = createAdminClient();

  const email = `demo-${crypto.randomUUID()}@chalk-demo.local`;
  const password = crypto.randomUUID();

  // Create user with admin API - email_confirm skips the verification step.
  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !data.user) {
    return { error: createError?.message ?? "Could not create demo account" };
  }

  // Admin-created users bypass the on_auth_user_created trigger, so create
  // the profile and join the demo team explicitly.
  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    team_id: "00000000-0000-0000-0000-000000000001",
    full_name: "",
    role: "head_coach",
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Could not initialize demo account" };
  }

  // Mark as demo for cleanup tracking (requires migration 0004, non-fatal if missing).
  await admin
    .from("profiles")
    .update({ is_demo: true })
    .eq("id", data.user.id);

  // Sign in as the new user to establish a browser session.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  redirect("/dashboard");
}
