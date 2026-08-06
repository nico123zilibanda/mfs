import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";

export default function Loading() {
  return (
    <main className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Inapakia muhtasari wa taarifa za wananchi."
      />

      <DashboardSkeleton />
    </main>
  );
}
