"use client";

import { LayoutDashboard, FileText, LogOut, House } from "lucide-react";

import Logo from "@/components/admin/logo";
import SidebarItem from "@/components/admin/sidebar-item";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout?: () => void;
};

export default function MobileSidebar({
  open,
  onOpenChange,
  onLogout,
}: MobileSidebarProps) {
  const handleNavigate = () => {
    onOpenChange(false);
  };

  const handleLogout = () => {
    onOpenChange(false);
    onLogout?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Admin Navigation</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="p-4">
            <Logo href={"dashboard"} label={"DED Mlele"} icon={<House className="h-5 w-5" />} />
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1">
          <nav className="flex-1 space-y-2 p-3">
            <div onClick={handleNavigate}>
              <SidebarItem
                href="/dashboard"
                label="Dashboard"
                icon={<LayoutDashboard className="h-5 w-5" />}
              />
            </div>

            <div onClick={handleNavigate}>
              <SidebarItem
                href="/reports"
                label="Reports"
                icon={<FileText className="h-5 w-5" />}
              />
            </div>
          </nav>
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />

              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}