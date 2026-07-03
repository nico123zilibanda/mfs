"use client";

import { useState, type ReactNode } from "react";

import MobileSidebar from "@/components/admin/mobile-sidebar";
import Sidebar from "@/components/admin/sidebar";
import Topbar from "@/components/admin/topbar";

type DashboardShellProps = {
  children: ReactNode;
  onLogout?: () => void;
};

export default function DashboardShell({
  children,
  onLogout,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden shrink-0 lg:block">
        <Sidebar onLogout={onLogout} />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenSidebar={() => setMobileOpen(true)}
          onLogout={onLogout}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}