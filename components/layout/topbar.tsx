"use client";

import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAdmin } from "@/lib/actions/auth";
import { createSupabaseBrowserClient } from "@/lib/auth/client";

export default function Topbar({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const initials = userEmail?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Fungua menyu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-bold text-slate-950 dark:text-slate-50">
            Kituo cha usimamizi
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Halmashauri ya Wilaya ya Mlele
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 sm:flex">
          <ShieldCheck className="h-4 w-4" /> Akaunti salama
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Fungua menyu ya akaunti">
              <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                <AvatarFallback className="bg-green-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="px-2 py-2">
              <p className="font-semibold text-foreground">Akaunti ya msimamizi</p>
              <p className="mt-1 truncate font-normal">{userEmail ?? "Haijapatikana"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ThemeToggle />
            <DropdownMenuSeparator />
            <form action={logoutAdmin}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive">
                <LogOut className="h-5 w-5" /> Ondoka
              </Button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
