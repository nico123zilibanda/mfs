import type { ReactNode } from "react";

type DashboardPageProps = {
  children: ReactNode;
};

export default function DashboardPage({
  children,
}: DashboardPageProps) {
  return (
    <div className="space-y-7">
      {children}
    </div>
  );
}
