import DashboardHeader from "@/components/admin/dashboard/dashboard-header";
import EmptyState from "@/components/admin/dashboard/empty-state";
import RecentFeedbackTable from "@/components/admin/dashboard/recent-feedback-table";
import StatsGrid from "@/components/admin/dashboard/stats-grid";

import {
  getDashboardStats,
  getRecentFeedback,
} from "@/lib/actions/dashboard";

export default async function AdminPage() {
  const [statsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getRecentFeedback(),
  ]);

  if (!statsResult.success) {
    return (
      <main className="space-y-6">
        <DashboardHeader
          title="Dashboard"
          description="Monitor citizen feedback and system statistics."
        />

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {statsResult.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Monitor citizen feedback and system statistics."
      />

      <StatsGrid stats={statsResult.data} />

      {recentResult.success && recentResult.data.length > 0 ? (
        <RecentFeedbackTable
          feedback={recentResult.data}
        />
      ) : (
        <EmptyState />
      )}
    </main>
  );
}