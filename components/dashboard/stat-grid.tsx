import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Inbox,
} from "lucide-react";

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
  const statCards = [
    {
      title: "Taarifa zote",
      value: stats.total,
      description: "Taarifa zote zilizowasilishwa",
      icon: ClipboardList,
    },
    {
      title: "Zilizopokelewa",
      value: stats.received,
      description: "Zinasubiri uchunguzi",
      icon: Inbox,
    },
    {
      title: "Zinachunguzwa",
      value: stats.inReview,
      description: "Zinapitiwa na msimamizi",
      icon: Clock3,
    },
    {
      title: "Zilizotatuliwa",
      value: stats.resolved,
      description: "Ushughulikiaji umekamilika",
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      aria-label="Muhtasari wa taarifa"
      className="
        grid
        gap-4
        sm:grid-cols-2
        lg:gap-5
        xl:grid-cols-4
      "
    >
      {statCards.map((stat) => (
        <StatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </section>
  );
}
