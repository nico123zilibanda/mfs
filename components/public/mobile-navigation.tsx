"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  LogIn,
  Menu,
  Search,
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
    href: "/tracking",
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
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-[min(22rem,calc(100vw-2rem))] flex-col p-0"
      >
        <SheetHeader className="border-b px-6 py-6">
          <PublicBrand />
        </SheetHeader>

        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-[#006b3c] text-white shadow-sm"
                    : "hover:bg-emerald-50",
                )}
              >
                <Icon className="h-5 w-5" />

                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Button
            asChild
            className="w-full bg-[#006b3c] hover:bg-[#005631]"
          >
            <Link
              href="/login"
              onClick={() => setOpen(false)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Ingia kama Msimamizi
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
