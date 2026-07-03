"use client";

import { LayoutDashboard, House, FileText, LogOut } from "lucide-react";

import Logo from "@/components/admin/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import SidebarItem from "./sidebar-item";

type SidebarProps = {
  onLogout?: () => void;
};

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="p-4">
        <Logo href={"dashboard"} 
        label={"DED Mlele"} 
        icon={<House className="h-5 w-5" />} />
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          <SidebarItem
            href="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
          />

          <SidebarItem
            href="/reports"
            label="Reports"
            icon={<FileText className="h-5 w-5" />}
          />
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />

          Logout
        </Button>
      </div>
    </aside>
  );
}