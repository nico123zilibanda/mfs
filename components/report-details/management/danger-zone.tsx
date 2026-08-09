"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Trash2 } from "lucide-react";

import { deleteFeedback } from "@/lib/actions/feedback-delete";

import type { Feedback } from "@/lib/types/feedback";

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

import { Button } from "@/components/ui/button";

import { CardDescription } from "@/components/ui/card";

type DangerZoneProps = {
  report: Feedback;
};

export default function DangerZone({
  report,
}: DangerZoneProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  async function handleDelete() {
    const result =
      await deleteFeedback({
        id: report.id,
      });

    if (!result.success) {
      toast.error(
        result.message ??
          "Failed to delete report."
      );

      return;
    }

    toast.success(
      result.message ??
        "Report deleted successfully."
    );

    setOpen(false);

    router.replace("/reports");

    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-green-700">
          Danger Zone
        </h3>

        <CardDescription>
          Soft delete this report. It
          will be removed from active
          reports but can be restored
          later if needed.
        </CardDescription>
      </div>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >
        <AlertDialogTrigger asChild>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />

            Delete Report
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this report?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action will not
              permanently remove the
              report. It will be hidden
              from active reports and
              can be restored later.
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
              onClick={(event) => {
                event.preventDefault();

                startTransition(
                  handleDelete
                );
              }}
            >
              {isPending
                ? "Deleting..."
                : "Delete Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
