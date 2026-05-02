"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, ClipboardList, BookOpen, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
};

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, hint: "Overview" },
  { href: "/film-room", label: "Film Room", icon: Film, hint: "Breakdown" },
  { href: "/board", label: "Board", icon: ClipboardList, hint: "Recruiting" },
  { href: "/playbook", label: "Playbook", icon: BookOpen, hint: "Game plan" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-bold tracking-tight">
          C
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide uppercase">Chalk</div>
          <div className="text-xs text-muted-foreground">Football intelligence</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, hint }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1 font-medium">{label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                {hint}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Intelligence layers
        </div>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Recognition
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Analytics
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-3" />
            Recommendation
          </li>
        </ul>
      </div>
    </aside>
  );
}
