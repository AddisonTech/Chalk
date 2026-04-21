"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, ClipboardList, BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { Wordmark } from "@/components/ui/wordmark";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavItem = { href: string; label: string; icon: typeof Film };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/film-room", label: "Film Room", icon: Film },
  { href: "/board", label: "Board", icon: ClipboardList },
  { href: "/playbook", label: "Playbook", icon: BookOpen },
];

export function Sidebar({
  userName,
  userInitials,
}: {
  userName: string;
  userInitials: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Wordmark />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors",
                active
                  ? "bg-surface-raised text-foreground"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
              {active && (
                <span className="ml-auto h-5 w-[2px] rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-sm px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-foreground">{userName}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
