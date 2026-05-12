import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Wordmark } from "@/components/ui/wordmark";
import { createClient } from "@/lib/supabase/server";

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-surface p-10 lg:border-b-0 lg:border-r">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative">
          <Wordmark size="md" />
        </div>
        <div className="relative flex flex-col gap-4">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
            Film becomes
            <br />
            strategy.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Break down opponent film, evaluate recruits, and build weekly game
            plans, all from one intelligence layer built for football staffs.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-6 text-xs uppercase tracking-wider text-muted">
          <span>Film Room</span>
          <span>Board</span>
          <span>Playbook</span>
        </div>
      </section>

      <section className="flex items-center justify-center p-10">
        <AuthForm />
      </section>
    </main>
  );
}
