"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogIn } from "lucide-react";

import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import PublicBrand from "./public-brand";
import GovernmentTopBar from "./government-top-bar";
import MobileNavigation from "./mobile-navigation";

const navigation = [
  {
    title: "Nyumbani",
    href: "/",
  },
  {
    title: "Fuatilia Taarifa",
    href: "/public/tracking",
  },
] as const;

export default function PublicNavbar() {
  const pathname = usePathname();

  return (
    <>
      <GovernmentTopBar />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-white/85">
        <Container className="flex h-18 items-center justify-between py-0 sm:h-20">
          <Link href="/" aria-label="Nyumbani - Ongea na DED Mlele">
            <PublicBrand />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Menyu kuu">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-7 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}

                {active && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#d4a017]" />
                )}
              </Link>
            );
          })}

          <Button asChild className="bg-[#006b3c] hover:bg-[#005631]">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Ingia
            </Link>
          </Button>
        </nav>

          <div className="lg:hidden">
            <MobileNavigation />
          </div>
        </Container>
      </header>
    </>
  );
}
