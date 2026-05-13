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

  // The on_auth_user_created trigger fires even for admin-created users and
  // creates the profile. Upsert here as a safety net in case the trigger
  // races or is missing; ignoreDuplicates means it's a no-op if the row
  // already exists.
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      team_id: "00000000-0000-0000-0000-000000000001",
      full_name: "",
      role: "head_coach",
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

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
