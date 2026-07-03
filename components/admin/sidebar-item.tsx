"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
};

export default function SidebarItem({
  href,
  label,
  icon,
}: SidebarItemProps) {
  const pathname = usePathname();

  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}