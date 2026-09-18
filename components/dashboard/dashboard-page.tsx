import type { ReactNode } from "react";
import PageTransition from "../layout/PageTransition";

type DashboardPageProps = {
  children: ReactNode;
};

export default function DashboardPage({
  children,
}: DashboardPageProps) {
  return (
    <PageTransition className="min-h-screen">
    <div className="space-y-7">
      {children}
    </div>
    </PageTransition>
  );
}
