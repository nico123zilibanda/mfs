"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  LogIn,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import PublicBrand from "./public-brand";

const navigation = [
  {
    title: "Nyumbani",
    href: "/",
    icon: Home,
  },
  {
    title: "Fuatilia Taarifa",
    href: "public/tracking",
    icon: Search,
  },
] as const;


export default function MobileNavigation() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);


  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >

      <SheetTrigger asChild>

        <Button
          size="icon"
          variant="ghost"
          aria-label="Fungua menyu"
          className="
            rounded-xl

            hover:bg-purple-50

            dark:hover:bg-purple-950/40
          "
        >

          <Menu
            className="
              h-6
              w-6

              text-slate-700

              dark:text-slate-200
            "
          />

        </Button>

      </SheetTrigger>


      <SheetContent
        side="right"
        className="
          flex
          w-[min(22rem,calc(100vw-2rem))]
          flex-col
          border-l
          border-slate-200
          bg-white
          p-0

          dark:border-slate-800
          dark:bg-slate-950
        "
      >

        {/* Header */}

        <SheetHeader
          className="
            border-b
            border-slate-200
            px-6
            py-6

            dark:border-slate-800
          "
        >

          <PublicBrand />

        </SheetHeader>


        {/* Navigation */}

        <nav
          className="
            flex-1
            space-y-2
            p-5
          "
        >

          <div
            className="
              mb-4
              flex
              items-center
              gap-2
              px-2
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-slate-400
            "
          >

            <ShieldCheck className="h-3.5 w-3.5" />

            Huduma za Wananchi

          </div>


          {navigation.map((item) => {

            const Icon = item.icon;

            const active =
              pathname === item.href;


            return (

              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={cn(
                  `
                  group
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  transition-all
                  `,
                  active
                    ? `
                      bg-[#6d28d9]
                      text-white
                      shadow-lg
                      shadow-purple-900/20
                    `
                    : `
                      text-slate-600
                      hover:bg-purple-50
                      hover:text-[#6d28d9]

                      dark:text-slate-300
                      dark:hover:bg-purple-950/40
                      dark:hover:text-purple-400
                    `
                )}
              >

                <Icon
                  className={cn(
                    `
                    h-5
                    w-5
                    transition-colors
                    `,
                    active
                      ? "text-white"
                      : `
                        text-slate-400
                        group-hover:text-[#6d28d9]

                        dark:group-hover:text-purple-400
                      `
                  )}
                />

                {item.title}

              </Link>

            );

          })}

        </nav>


        {/* Login */}

        <div
          className="
            border-t
            border-slate-200
            p-5

            dark:border-slate-800
          "
        >

          <Button
            asChild
            className="
              h-12
              w-full
              rounded-xl

              bg-[#6d28d9]
              text-white
              hover:bg-[#4c1d95]

              dark:bg-purple-600
              dark:hover:bg-purple-700
            "
          >

            <Link
              href="/login"
              onClick={() =>
                setOpen(false)
              }
            >

              <LogIn
                className="
                  mr-2
                  h-4
                  w-4
                "
              />

              Ingia kama Msimamizi

            </Link>

          </Button>


          <p
            className="
              mt-4
              text-center
              text-xs
              text-slate-400
            "
          >
            Mfumo wa Maoni na Malalamiko
          </p>

        </div>


      </SheetContent>

    </Sheet>
  );
}