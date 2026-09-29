"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

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

import {
  createSupabaseBrowserClient,
} from "@/lib/auth/client";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export default function Topbar({
  onOpenSidebar,
}: TopbarProps) {
  const [userEmail, setUserEmail] =
    useState<string | null>(null);

  useEffect(() => {
    const supabase =
      createSupabaseBrowserClient();

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        setUserEmail(
          data.user?.email ?? null
        );
      });
  }, []);

  const initials =
    userEmail
      ?.slice(0, 2)
      .toUpperCase() ?? "AD";

  return (
    <header
      className="
        sticky
        top-0
        z-40
        h-16
        border-b
        border-slate-200/80
        bg-white/90
        backdrop-blur-xl
        supports-backdrop-filter:bg-white/75
        dark:border-slate-800
        dark:bg-slate-950/90
        dark:supports-backdrop-filter:bg-slate-950/75
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            LEFT
        ====================================================== */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Menu */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenSidebar}
            aria-label="Fungua menyu"
            className="
              h-9
              w-9
              shrink-0
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              text-slate-600
              hover:bg-slate-100
              hover:text-slate-900
              lg:hidden
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <Menu className="h-4.5 w-4.5" />
          </Button>

          {/* Page Identity */}
          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-bold
                tracking-tight
                text-slate-900
                sm:text-base
                dark:text-white
              "
            >
              Dashibodi
            </p>

            <p
              className="
                hidden
                truncate
                max-w-70
                text-xs
                text-slate-500
                sm:block
                dark:text-slate-400
              "
            >
              {userEmail
                ? `Karibu tena, ${userEmail}`
                : "Muhtasari wa mfumo wa usimamizi"}
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT
        ====================================================== */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Secure Account */}
          <div
            className="
              hidden
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-100
              bg-emerald-50
              px-3
              py-2
              text-[11px]
              font-semibold
              text-emerald-700
              sm:flex
              dark:border-emerald-900/50
              dark:bg-emerald-950/30
              dark:text-emerald-400
            "
          >
            <CheckCircle2 className="h-3.5 w-3.5" />

            <span>Akaunti salama</span>
          </div>

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="
                  h-auto
                  rounded-full
                  p-0.5
                  outline-none
                  ring-offset-2
                  transition-all
                  hover:bg-slate-100
                  focus-visible:ring-2
                  focus-visible:ring-purple-500/40
                  dark:hover:bg-slate-900
                "
                aria-label="Fungua menyu ya akaunti"
              >
                <Avatar
                  className="
                    h-9
                    w-9
                    border
                    border-purple-100
                    bg-purple-50
                    shadow-sm
                    dark:border-purple-900/50
                    dark:bg-purple-950/40
                  "
                >
                  <AvatarFallback
                    className="
                      bg-purple-50
                      text-xs
                      font-bold
                      text-purple-700
                      dark:bg-purple-950/40
                      dark:text-purple-300
                    "
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="
                w-72
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-xl
                shadow-slate-950/10
                dark:border-slate-800
                dark:bg-slate-900
                dark:shadow-black/30
              "
            >
              {/* Account Header */}
              <DropdownMenuLabel
                className="
                  rounded-xl
                  bg-slate-50
                  px-3
                  py-3
                  dark:bg-slate-800/60
                "
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    className="
                      h-10
                      w-10
                      shrink-0
                      border
                      border-purple-100
                      dark:border-purple-900/50
                    "
                  >
                    <AvatarFallback
                      className="
                        bg-purple-50
                        text-xs
                        font-bold
                        text-purple-700
                        dark:bg-purple-950/40
                        dark:text-purple-300
                      "
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p
                      className="
                        text-sm
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Msimamizi
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        font-normal
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {userEmail ??
                        "Barua pepe haipatikani"}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-2" />

              {/* Security */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                "
              >
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-50
                    text-emerald-600
                    dark:bg-emerald-950/40
                    dark:text-emerald-400
                  "
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Akaunti salama
                  </p>

                  <p
                    className="
                      text-[10px]
                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    Muunganisho umelindwa
                  </p>
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              {/* Theme */}
              <ThemeToggle />

              <DropdownMenuSeparator className="my-2" />

              {/* Logout */}
              <form action={logoutAdmin}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="
                    h-10
                    w-full
                    justify-start
                    gap-3
                    rounded-xl
                    px-3
                    text-sm
                    font-medium
                    text-slate-600
                    hover:bg-red-50
                    hover:text-red-600
                    dark:text-slate-400
                    dark:hover:bg-red-950/30
                    dark:hover:text-red-400
                  "
                >
                  <LogOut className="h-4 w-4" />

                  Ondoka
                </Button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
