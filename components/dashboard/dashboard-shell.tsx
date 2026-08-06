"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      <Sidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      <div className="min-h-screen lg:pl-72">
        <Topbar
          onOpenSidebar={() =>
            setMobileSidebarOpen(true)
          }
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
