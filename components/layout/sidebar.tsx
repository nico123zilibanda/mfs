"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { logoutAdmin } from "@/lib/actions/auth";

type SidebarProps = { open: boolean; onOpenChange: (open: boolean) => void };
const navigation = [
  { title: "Dashibodi", href: "/dashboard", icon: LayoutDashboard },
  { title: "Taarifa zote", href: "/reports", icon: FileText },
  { title: "Taarifa zilizofutwa", href: "/reports/deleted", icon: Trash2 },
  { title: "Ufuatiliaji", href: "/trackings", icon: ClipboardList },
] as const;

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-slate-950 lg:block">
        <SidebarContent />
      </aside>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-72 border-0 bg-slate-950 p-0 text-slate-100"
        >
          <SheetTitle className="sr-only">Menyu ya msimamizi</SheetTitle>
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4a017] text-slate-950 shadow-lg shadow-amber-500/10">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold tracking-tight text-white">Ongea na DED</p>
            <p className="text-xs text-slate-400">Mlele · Msimamizi</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4" aria-label="Menyu ya msimamizi">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Usimamizi
        </p>
        <div className="space-y-1">
          {navigation.map(({ title, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href === "/reports" &&
                pathname.startsWith("/reports/") &&
                !pathname.startsWith("/reports/deleted"));
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-400 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {title}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-white/10 p-4">
            <form action={logoutAdmin}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:text-destructive">
                <LogOut className="h-5 w-5" /> Ondoka
              </Button>
            </form>
        <p className="mt-4 text-center text-xs text-green-600">
          Mfumo wa Mlele · 1.0
        </p>
      </div>
    </div>
  );
}
