 
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
      title: "Imetumwa",
      date: report.createdAt,
    },
    {
      title: "Ilisasishwa",
      date: report.updatedAt,
    },
  ];

  return (
    <Card className="border-green-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-green-700">
          Mfuatano wa taarifa
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {timeline.map((event, index) => (
            <div
              key={event.title}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />

                {index <
                  timeline.length - 1 && (
                  <div className="mt-2 h-full w-px bg-green-100" />
                )}
              </div>

              <div className="pb-6">
                <p className="font-medium">
                  {event.title}
                </p>

                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
