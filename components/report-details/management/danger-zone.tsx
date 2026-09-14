"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "sonner";

import {
  Archive,
  AlertTriangle,
} from "lucide-react";

import {
  deleteFeedback,
} from "@/lib/actions/feedback-delete";

import type {
  Feedback,
} from "@/lib/types/feedback";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DangerZoneProps = {
  report: Feedback;
};

export default function DangerZone({
  report,
}: DangerZoneProps) {

  const router = useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  async function handleDelete() {

    const result =
      await deleteFeedback({
        id: report.id,
      });

    if (!result.success) {

      toast.error(
        result.message ??
          "Failed to archive report."
      );

      return;
    }

    toast.success(
      result.message ??
        "Report archived successfully."
    );

    setOpen(false);

    router.replace("/all-reports");

    router.refresh();
  }

  return (
    <Card className="overflow-hidden border-amber-200 shadow-sm dark:border-amber-900/40">

      {/* Warning Accent */}

      <div className="h-1 w-full bg-amber-500" />

      <CardHeader className="space-y-3">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">

            <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400" />

          </div>

          <div>

            <CardTitle className="text-lg text-amber-700 dark:text-amber-400">
              Hifadhi Taarifa
            </CardTitle>

            <CardDescription>
              Kitendo kinachoweza kubatilishwa.
            </CardDescription>

          </div>

        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          Ripoti hii itatolewa kwenye ripoti zinazotumika sasa na kuhamishwa kwenye jarada. 
          Inaweza kurejeshwa wakati wowote
        </p>

      </CardHeader>

      <CardContent>

        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >

          <AlertDialogTrigger asChild>

            <Button
              variant="outline"
              disabled={isPending}
              className="
                w-full
                border-amber-300
                text-amber-700
                hover:bg-amber-50
                hover:text-amber-800
                dark:border-amber-800
                dark:text-amber-400
                dark:hover:bg-amber-950/20
              "
            >

              <Archive className="mr-2 h-4 w-4" />

              Hifadhi Taarifa

            </Button>

          </AlertDialogTrigger>

          <AlertDialogContent>

            <AlertDialogHeader>

              <AlertDialogTitle>
               Hifadhi Taarifa hii?
              </AlertDialogTitle>

              <AlertDialogDescription>
                 Ripoti hii itatolewa kwenye ripoti zinazotumika sasa na kuhamishwa kwenye jarada. 
                 Inaweza kurejeshwa wakati wowote
              </AlertDialogDescription>

            </AlertDialogHeader>

            <AlertDialogFooter>

              <AlertDialogCancel
                disabled={isPending}
              >
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-700"
                onClick={(event) => {

                  event.preventDefault();

                  startTransition(
                    handleDelete
                  );

                }}
              >

                {isPending
                  ? "Kuhifadhi..."
                  : "Hifadhi Taarifa"}

              </AlertDialogAction>

            </AlertDialogFooter>

          </AlertDialogContent>

        </AlertDialog>

      </CardContent>

    </Card>
  );
}