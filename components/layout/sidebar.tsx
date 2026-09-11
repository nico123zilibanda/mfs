"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  logoutAdmin,
} from "@/lib/actions/auth";

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const navigation = [
  {
    title: "Dashibodi",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Taarifa Zote",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Taarifa Zilizohifadhiwa",
    href: "/reports/deleted",
    icon: Trash2,
  },
  {
    title: "Ufuatiliaji",
    href: "/trackings",
    icon: ClipboardList,
  },
] as const;

export default function Sidebar({
  open,
  onOpenChange,
}: SidebarProps) {
  return (
    <>
      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-50
          hidden
          w-72
          border-r
          border-purple-900/30
          bg-slate-950
          lg:block
        "
      >
        <SidebarContent />
      </aside>

      <Sheet
        open={open}
        onOpenChange={onOpenChange}
      >
        <SheetContent
          side="left"
          className="
            w-72
            border-0
            bg-slate-950
            p-0
            text-white
          "
        >
          <SheetTitle className="sr-only">
            Menyu ya Msimamizi
          </SheetTitle>

          <SidebarContent
            onNavigate={() =>
              onOpenChange(false)
            }
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">

      {/* Branding */}

      <div className="border-b border-white/10 p-6">

        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-4"
        >

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-white
              p-2
              shadow-lg
              shadow-purple-950/30
              ring-1
              ring-purple-500/20
            "
          >

            <Image
              src="/images/logo.jpeg"
              alt="Nembo ya Halmashauri ya Mlele"
              width={42}
              height={42}
              sizes="20"
              priority
              className="object-contain"
            />

          </div>

          <div>

            <h2 className="text-lg font-bold tracking-tight text-white">
              Ongea na DED
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Halmashauri ya Wilaya ya Mlele
            </p>

            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-purple-400">
              Mfumo wa Serikali
            </p>

          </div>

        </Link>

      </div>

      {/* Navigation */}

      <nav
        className="flex-1 p-4"
        aria-label="Menyu ya msimamizi"
      >

        <div
          className="
            mb-5
            flex
            items-center
            gap-2
            px-3
            text-xs
            font-semibold
            uppercase
            tracking-[0.16em]
            text-slate-500
          "
        >

          <ShieldCheck className="h-3.5 w-3.5" />

          Usimamizi

        </div>

        <div className="space-y-2">

          {navigation.map(
            ({
              title,
              href,
              icon: Icon,
            }) => {

              const active =
                pathname === href ||
                (
                  href === "/reports" &&
                  pathname.startsWith("/reports/") &&
                  !pathname.startsWith("/reports/deleted")
                );

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    `
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                    `,
                    active
                      ? `
                          bg-purple-600
                          text-white
                          shadow-lg
                          shadow-purple-900/30
                        `
                      : `
                          text-slate-400
                          hover:bg-slate-900
                          hover:text-white
                        `
                  )}
                >

                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-purple-400"
                    )}
                  />

                  {title}

                </Link>
              );

            }
          )}

        </div>

      </nav>

      {/* Footer */}

      <div className="border-t border-white/10 p-4">

        <form action={logoutAdmin}>

          <Button
            type="submit"
            variant="ghost"
            className="
              w-full
              justify-start
              gap-3
              rounded-xl
              text-slate-300
              hover:bg-red-950/40
              hover:text-red-400
            "
          >

            <LogOut className="h-5 w-5" />

            Ondoka

          </Button>

        </form>

        <div className="mt-6 rounded-xl border border-white/5 bg-slate-900/50 p-3 text-center">

          <p className="text-sm font-semibold text-purple-400">
            Mfumo wa Mlele
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Halmashauri ya Wilaya ya Mlele
          </p>

          <div className="mt-3 h-px bg-white/10" />

          <p className="mt-3 text-[11px] uppercase tracking-wider text-slate-600">
            Version 1.0
          </p>

        </div>

      </div>

    </div>
  );
}