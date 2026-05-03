"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  email: string;
};

export function UserMenu({ email }: Props) {
  return (
    <form action="/auth/signout" method="POST" className="space-y-2">
      <div className="flex items-center gap-2 px-1 py-1">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Signed in
          </div>
          <div className="truncate text-xs text-foreground" title={email}>
            {email}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </Button>
    </form>
  );
}
