import { CheckCircle2, ClipboardList, Clock3, Inbox } from "lucide-react";

import StatsCard from "./stat-card";

type DashboardStats = {
  total: number;
  received: number;
  inReview: number;
  resolved: number;
};

type StatsGridProps = {
  stats: DashboardStats;
};

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Taarifa zote"
        value={stats.total}
        description="Taarifa zote zilizowasilishwa"
        icon={ClipboardList}
      />

      <StatsCard
        title="Zilizopokelewa"
        value={stats.received}
        description="Zinasubiri uchunguzi"
        icon={Inbox}
      />

      <StatsCard
        title="Zinachunguzwa"
        value={stats.inReview}
        description="Zinapitiwa na msimamizi"
        icon={Clock3}
      />

      <StatsCard
        title="Zilizotatuliwa"
        value={stats.resolved}
        description="Ushughulikiaji umekamilika"
        icon={CheckCircle2}
      />
    </section>
  );
}
