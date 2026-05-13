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

  // The handle_new_user trigger already created the profile linked to the demo team.
  // Mark it so it can be cleaned up later.
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
