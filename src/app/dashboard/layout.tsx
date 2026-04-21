import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name || user.email || "Coach";
  const initials = buildInitials(name);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      <Sidebar userName={name} userInitials={initials} />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
