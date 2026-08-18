"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { RotateCcw, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { restoreFeedback } from "@/lib/actions/feedback-restore";

import type { Feedback } from "@/lib/types/feedback";

type RestoreCardProps = {
  report: Feedback;
};

export default function RestoreCard({
  report,
}: RestoreCardProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreFeedback({
        id: report.id,
      });

      if (!result.success) {
        toast.error(
          result.message ?? "Failed to restore report."
        );

        return;
      }

      toast.success(
        result.message ?? "Report restored successfully."
      );

      router.replace(`/reports/${report.id}`);
      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      {/* Government Accent */}
      <div className="h-1 w-full bg-emerald-700" />

      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
            <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>

          <div>
            <CardTitle className="text-lg">
              Restore Report
            </CardTitle>

            <CardDescription>
              Recovery action
            </CardDescription>
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          This report is currently archived. Restoring it will
          return the report to active citizen feedback records.
        </p>
      </CardHeader>

      <CardContent>
        <Button
          className="
            w-full
            bg-emerald-700
            text-white
            hover:bg-emerald-800
            dark:bg-emerald-600
            dark:hover:bg-emerald-700
          "
          disabled={isPending}
          onClick={handleRestore}
        >
          <RotateCcw className="mr-2 h-4 w-4" />

          {isPending
            ? "Restoring..."
            : "Restore Report"}
        </Button>
      </CardContent>
    </Card>
  );
}