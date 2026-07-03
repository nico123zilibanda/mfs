import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import DashboardSkeleton from "@/components/admin/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <main className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Monitor citizen feedback and system statistics."
      />

      <DashboardSkeleton />
    </main>
  );
}