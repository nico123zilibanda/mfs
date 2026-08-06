"use client";

import {
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  RotateCcw,
} from "lucide-react";


import {
  restoreFeedback,
} from "@/lib/actions/feedback-restore";


import type {
  Feedback,
} from "@/lib/types/feedback";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import {
  Button,
} from "@/components/ui/button";


type RestoreCardProps = {
  report: Feedback;
};


export default function RestoreCard({
  report,
}: RestoreCardProps) {

  const router = useRouter();


  const [
    isPending,
    startTransition,
  ] = useTransition();



  function handleRestore() {

    startTransition(async () => {

      const result =
        await restoreFeedback({
          id: report.id,
        });


      if (!result.success) {

        toast.error(
          result.message ??
          "Failed to restore report."
        );

        return;
      }


      toast.success(
        result.message ??
        "Report restored successfully."
      );


      router.replace(
        `/reports/${report.id}`
      );


      router.refresh();

    });
  }



  return (
    <Card>

      <CardHeader>

        <CardTitle>
          Restore Report
        </CardTitle>


        <CardDescription>
          This report is currently
          deleted. Restore it to make
          it visible again in active
          reports.
        </CardDescription>

      </CardHeader>



      <CardContent>

        <Button
          className="w-full"
          disabled={isPending}
          onClick={handleRestore}
        >

          <RotateCcw
            className="mr-2 h-4 w-4"
          />


          {isPending
            ? "Restoring..."
            : "Restore Report"
          }

        </Button>

      </CardContent>

    </Card>
  );
}
