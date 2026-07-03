import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Inbox,
} from "lucide-react";

import StatsCard from "./stats-card";

type DashboardStats = {
  total: number;
  received: number;
  inReview: number;
  resolved: number;
};

type StatsGridProps = {
  stats: DashboardStats;
};

export default function StatsGrid({
  stats,
}: StatsGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Total Feedback"
        value={stats.total}
        description="All submitted feedback"
        icon={ClipboardList}
      />

      <StatsCard
        title="Received"
        value={stats.received}
        description="Waiting for review"
        icon={Inbox}
      />

      <StatsCard
        title="In Review"
        value={stats.inReview}
        description="Currently under review"
        icon={Clock3}
      />

      <StatsCard
        title="Resolved"
        value={stats.resolved}
        description="Successfully resolved"
        icon={CheckCircle2}
      />
    </section>
  );
}