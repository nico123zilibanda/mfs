"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import StatusBadge from "@/components/tracking/StatusBadge";

import type { FeedbackTracking } from "@/lib/types/tracking";

type TrackingResultCardProps = {
  feedback: FeedbackTracking;
};

export default function TrackingResultCard({
  feedback,
}: TrackingResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Taarifa za Mrejesho
        </CardTitle>

        <CardDescription>
          Hapa unaweza kuona taarifa za mrejesho uliowasilisha pamoja na hali yake ya sasa.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Hali ya Mrejesho
            </p>

            <StatusBadge status={feedback.status} />
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">
              Tarehe ya Kuwasilishwa
            </p>

            <p className="font-medium">
              {new Date(feedback.createdAt).toLocaleDateString("sw-TZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Namba ya Marejeleo
            </p>

            <p className="font-semibold">
              {feedback.referenceNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Jina Kamili
            </p>

            <p className="font-medium">
              {feedback.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Kijiji
            </p>

            <p>{feedback.village}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Kata
            </p>

            <p>{feedback.ward}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Namba ya Simu
            </p>

            <p>{feedback.phone}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Je, uliombwa rushwa?
            </p>

            <p>
              {feedback.hasBribeRequest ? "Ndiyo" : "Hapana"}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            Maelezo ya Ufisadi
          </p>

          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="whitespace-pre-wrap leading-7">
              {feedback.corruptionDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}