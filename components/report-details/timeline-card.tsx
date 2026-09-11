import {
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Feedback } from "@/lib/types/feedback";

type TimelineCardProps = {
  report: Feedback;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function TimelineCard({
  report,
}: TimelineCardProps) {
  const timeline = [
    {
      title: "Taarifa Imewasilishwa",
      description: "Mwananchi aliwasilisha taarifa kupitia mfumo.",
      date: report.createdAt,
    },
    {
      title: "Taarifa Ilisasishwa",
      description: "Taarifa ilipokea mabadiliko ya mwisho.",
      date: report.updatedAt,
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarClock className="h-5 w-5 text-purple-700 dark:text-purple-500" />
          Mfuatano wa Taarifa
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="relative">
          {timeline.map((event, index) => (
            <div
              key={event.title}
              className="relative flex gap-5 pb-8 last:pb-0"
            >
              {/* Timeline */}
              <div className="relative flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40">
                  <CheckCircle2 className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                </div>

                {index !== timeline.length - 1 && (
                  <div className="mt-2 h-full w-px bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold text-foreground">
                    {event.title}
                  </h3>

                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDate(event.date)}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}