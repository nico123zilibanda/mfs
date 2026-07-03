"use client";

import { Menu, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

type TopbarProps = {
  onOpenSidebar?: () => void;
  onLogout?: () => void;
};

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
};

export default function Topbar({
  onOpenSidebar,
  onLogout,
}: TopbarProps) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/reports/")
      ? "Report Details"
      : "Dashboard");

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>DED</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">

          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}