import type { ReactNode } from "react";

import DashboardShell from "@/components/admin/dashboard-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}