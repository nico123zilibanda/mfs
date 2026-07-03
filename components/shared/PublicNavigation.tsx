"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

import {
  FileText,
  Search,
} from "lucide-react";

type PublicNavigationProps = {
  current: "feedback" | "tracking";
};

const items = [
  {
    key: "feedback",
    title: "Toa Taarifa",
    description:
      "Wasilisha taarifa mpya ya rushwa au malalamiko.",
    href: "/",
    icon: FileText,
  },
  {
    key: "tracking",
    title: "Fuatilia Taarifa",
    description:
      "Angalia maendeleo ya taarifa uliyowasilisha.",
    href: "/tracking",
    icon: Search,
  },
] as const;

export default function PublicNavigation({
  current,
}: PublicNavigationProps) {
  const pathname = usePathname();

  return (
    
    <Card className="border-border/60 shadow-sm">
        
      <CardHeader className="pb-4">
        <CardTitle>
          Chagua Huduma
        </CardTitle>

        <CardDescription>
          Unaweza kutuma taarifa mpya au kufuatilia
          taarifa uliyokwisha kuwasilisha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;

            const active =
              current === item.key ||
              pathname === item.href;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "group rounded-xl border p-5 transition-all duration-200",
                  "hover:border-primary hover:bg-muted/40",
                  active &&
                    "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
    
  );
}