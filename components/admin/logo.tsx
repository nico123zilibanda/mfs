"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function SidebarItem({
  href,
  label,
  icon,
}: SidebarItemProps) {
  const pathname = usePathname();

  const isActive =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}