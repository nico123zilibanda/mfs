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
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-slate-50
        text-slate-950
        dark:bg-slate-950
        dark:text-slate-50
      "
    >
      {/* Sidebar */}
      <Sidebar
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />

      {/* Main Application Area */}
      <div className="min-h-screen lg:pl-72">
        {/* Top Navigation */}
        <Topbar
          onOpenSidebar={() =>
            setMobileSidebarOpen(true)
          }
        />

        {/* Page Content */}
        <main
          className="
            w-full
            px-4
            py-5
            sm:px-6
            sm:py-6
            lg:px-8
            lg:py-8
            xl:px-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
