"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Trash2,
} from "lucide-react";

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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { permanentlyDeleteFeedback } from "@/lib/actions/feedback-permanent-delete";

import type { Feedback } from "@/lib/types/feedback";

type PermanentDeleteDangerZoneProps = {
  report: Feedback;
};

export default function PermanentDeleteDangerZone({
  report,
}: PermanentDeleteDangerZoneProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const result = await permanentlyDeleteFeedback({
      id: report.id,
    });

    if (!result.success) {
      toast.error(
        result.message ??
          "Imeshindikana kufuta taarifa kabisa.",
      );

      return;
    }

    toast.success(
      result.message ??
        "Taarifa imefutwa kabisa.",
    );

    setOpen(false);

    router.replace("/deleted");
    router.refresh();
  }

  return (
    <Card
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-red-200
        bg-white
        shadow-sm
        dark:border-red-900/50
        dark:bg-slate-900
      "
    >
      {/* Danger Accent */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-linear-to-r
          from-red-500
          via-red-600
          to-rose-600
        "
      />

      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-600
              ring-1
              ring-red-100
              dark:bg-red-950/40
              dark:text-red-400
              dark:ring-red-900/50
            "
          >
            <AlertTriangle className="h-5 w-5" />
          </div>

          {/* Heading */}
          <div className="min-w-0">
            <CardTitle
              className="
                text-lg
                font-bold
                text-red-700
                dark:text-red-400
              "
            >
              Eneo la hatari
            </CardTitle>

            <CardDescription
              className="
                mt-1
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Kufuta taarifa kabisa kutoka kwenye mfumo.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Warning Notice */}
        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-100
            bg-red-50/70
            p-4
            dark:border-red-900/40
            dark:bg-red-950/20
          "
        >
          <ShieldAlert
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-red-600
              dark:text-red-400
            "
          />

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-red-900
                dark:text-red-200
              "
            >
              Kitendo hiki hakiwezi kutenduliwa
            </p>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-red-800/80
                dark:text-red-300/80
              "
            >
              Taarifa itafutwa kabisa kutoka kwenye mfumo na
              haitaweza kurejeshwa baada ya kufutwa.
            </p>
          </div>
        </div>

        {/* Action */}
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="
                w-full
                rounded-xl
                border-red-300
                bg-white
                font-semibold
                text-red-700
                shadow-sm
                transition-all
                hover:border-red-400
                hover:bg-red-50
                hover:text-red-800
                dark:border-red-800
                dark:bg-slate-900
                dark:text-red-400
                dark:hover:border-red-700
                dark:hover:bg-red-950/30
              "
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Futa Taarifa Kabisa
              <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="
              rounded-2xl
              border-red-100
              dark:border-red-900/50
            "
          >
            <AlertDialogHeader>
              {/* Dialog Icon */}
              <div
                className="
                  mb-2
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  text-red-600
                  dark:bg-red-950/40
                  dark:text-red-400
                "
              >
                <Trash2 className="h-5 w-5" />
              </div>

              <AlertDialogTitle
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Futa taarifa hii kabisa?
              </AlertDialogTitle>

              <AlertDialogDescription
                className="
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Taarifa yenye kumbukumbu{" "}
                <span
                  className="
                    font-mono
                    font-semibold
                    text-slate-700
                    dark:text-slate-200
                  "
                >
                  {report.referenceNumber}
                </span>{" "}
                itafutwa kabisa kutoka kwenye mfumo.
                <span
                  className="
                    mt-2
                    block
                    font-semibold
                    text-red-600
                    dark:text-red-400
                  "
                >
                  Kitendo hiki hakiwezi kutenduliwa.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="gap-2 sm:gap-3">
              <AlertDialogCancel
                disabled={isPending}
                className="
                  rounded-xl
                  border-slate-200
                  dark:border-slate-700
                "
              >
                Ghairi
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={isPending}
                className="
                  rounded-xl
                  bg-red-600
                  font-semibold
                  text-white
                  shadow-sm
                  hover:bg-red-700
                  focus:ring-red-500
                "
                onClick={(event) => {
                  event.preventDefault();

                  startTransition(handleDelete);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {isPending
                  ? "Inafuta..."
                  : "Futa Kabisa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
