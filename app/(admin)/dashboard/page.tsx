import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardPage from "@/components/dashboard/dashboard-page";
import PageSection from "@/components/dashboard/page-section";
import QuickActions from "@/components/dashboard/quick-actions";
import StatsGrid from "@/components/dashboard/stat-grid";

import DataTableEmpty from "@/components/table/data-table-empty";

import RecentRptTable from "./recent-rpt-table";

import { getDashboardStats, getRecentFeedback } from "@/lib/actions/dashboard";

export default async function AdminPage() {
  const [statsResult, recentResult] = await Promise.all([
    getDashboardStats(),
    getRecentFeedback(),
  ]);

  if (!statsResult.success) {
    return (
      <DashboardPage>
        <DashboardHeader
          title="Dashibodi"
          description="Fuatilia taarifa za wananchi na mwenendo wa mfumo."
        />

        <div
          className="
            rounded-xl
            border
            border-destructive/20
            bg-destructive/5
            p-6
          "
        >
          <h2
            className="
              text-lg
              font-semibold
              text-destructive
            "
          >
            Dashibodi haikuweza kupakiwa
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-muted-foreground
            "
          >
            {statsResult.message}
          </p>
        </div>
      </DashboardPage>
    );
  }

  const recentFeedback = recentResult.success ? recentResult.data : [];

  return (
    <DashboardPage>
      {/* Header */}

      <DashboardHeader
        title="Dashibodi"
        description="Muhtasari wa taarifa za wananchi na hatua za ushughulikiaji."
      />

      {/* Statistics */}

      <StatsGrid stats={statsResult.data} />

      {/* Recent Reports */}

      <PageSection>
        {recentFeedback.length > 0 ? (
          <RecentRptTable reports={recentFeedback} />
        ) : (
          <DataTableEmpty
            title="Hakuna taarifa za karibuni"
            description="Taarifa za wananchi zitaonekana hapa zitakapowasilishwa."
          />
        )}
      </PageSection>

      {/* Quick Actions */}

      <QuickActions />
    </DashboardPage>
  );
}