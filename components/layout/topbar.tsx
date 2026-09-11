"use client";

import { useEffect, useState } from "react";

import {
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  Button,
} from "@/components/ui/button";

import ThemeToggle from "@/components/theme/theme-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  logoutAdmin,
} from "@/lib/actions/auth";

import {
  createSupabaseBrowserClient,
} from "@/lib/auth/client";

type TopbarProps = {
  onOpenSidebar: () => void;
};

export default function Topbar({
  onOpenSidebar,
}: TopbarProps) {

  const [
    userEmail,
    setUserEmail,
  ] = useState<string | null>(null);

  useEffect(() => {

    const supabase =
      createSupabaseBrowserClient();

    void supabase.auth
      .getUser()
      .then(({ data }) =>
        setUserEmail(
          data.user?.email ?? null
        )
      );

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
        flex
        h-18
        items-center
        justify-between
        border-b
        border-border
        bg-background/95
        px-4
        backdrop-blur-xl
        supports-backdrop-filter:bg-background/80
        lg:px-8
      "
    >

      {/* Left */}

      <div className="flex items-center gap-4">

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

          <p className="text-base font-bold tracking-tight text-foreground">
            Mfumo wa Usimamizi
          </p>

          <p className="text-sm text-muted-foreground">
            Halmashauri ya Wilaya ya Mlele
          </p>

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* Security Badge */}

        <div
          className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-purple-200
            bg-purple-50
            px-4
            py-2
            text-xs
            font-semibold
            text-purple-700
            dark:border-purple-900
            dark:bg-purple-950/30
            dark:text-purple-400
            sm:flex
          "
        >

          <ShieldCheck className="h-4 w-4" />

          Akaunti Salama

        </div>

        {/* Account */}

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <Button
              variant="ghost"
              className="h-auto rounded-full p-1"
            >

              <Avatar className="h-10 w-10 border border-border shadow-sm">

                <AvatarFallback
                  className="
                    bg-purple-700
                    text-sm
                    font-bold
                    text-white
                    dark:bg-purple-600
                  "
                >
                  {initials}
                </AvatarFallback>

              </Avatar>

            </Button>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72"
          >

            <DropdownMenuLabel className="space-y-1">

              <p className="font-semibold">
                Akaunti ya Msimamizi
              </p>

              <p className="truncate text-sm font-normal text-muted-foreground">
                {userEmail ??
                  "Barua pepe haipatikani"}
              </p>

            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <ThemeToggle />

            <DropdownMenuSeparator />

            <form action={logoutAdmin}>

              <Button
                type="submit"
                variant="ghost"
                className="
                  w-full
                  justify-start
                  gap-3
                  rounded-lg
                  text-destructive
                  hover:text-destructive
                "
              >

                <LogOut className="h-4 w-4" />

                Ondoka

              </Button>

            </form>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </header>
  );
}