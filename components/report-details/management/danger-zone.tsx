"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

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

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const result = await deleteFeedback({
      id: report.id,
    });

    if (!result.success) {
      toast.error(
        result.message ??
          "Imeshindikana kuhifadhi taarifa.",
      );

      return;
    }

    toast.success(
      result.message ??
        "Taarifa imehifadhiwa kikamilifu.",
    );

    setOpen(false);

    router.replace("/all-reports");
    router.refresh();
  }

  return (
    <Card
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-amber-200
        bg-white
        shadow-sm
        dark:border-amber-900/50
        dark:bg-slate-900
      "
    >
      {/* Warning Accent */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-linear-to-r
          from-amber-400
          via-amber-500
          to-orange-500
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
              bg-amber-50
              text-amber-600
              ring-1
              ring-amber-100
              dark:bg-amber-950/40
              dark:text-amber-400
              dark:ring-amber-900/50
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
                text-slate-900
                dark:text-white
              "
            >
              Hifadhi taarifa
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
              Kitendo hiki kitaondoa taarifa kwenye orodha
              ya taarifa zinazotumika sasa.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Information Notice */}
        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-amber-100
            bg-amber-50/70
            p-4
            dark:border-amber-900/40
            dark:bg-amber-950/20
          "
        >
          <ShieldAlert
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-amber-600
              dark:text-amber-400
            "
          />

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-amber-900
                dark:text-amber-200
              "
            >
              Kuhusu kuhifadhi taarifa
            </p>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-amber-800/80
                dark:text-amber-300/80
              "
            >
              Ripoti hii itaondolewa kwenye ripoti zinazotumika
              sasa na kuhamishwa kwenye jarada. Inaweza
              kurejeshwa wakati wowote.
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
                border-amber-300
                bg-white
                font-semibold
                text-amber-700
                shadow-sm
                transition-all
                hover:border-amber-400
                hover:bg-amber-50
                hover:text-amber-800
                dark:border-amber-800
                dark:bg-slate-900
                dark:text-amber-400
                dark:hover:border-amber-700
                dark:hover:bg-amber-950/30
              "
            >
              <Archive className="mr-2 h-4 w-4" />
              Hifadhi Taarifa
              <ArrowRight className="ml-auto h-4 w-4 opacity-60" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="
              rounded-2xl
              border-slate-200
              dark:border-slate-800
            "
          >
            <AlertDialogHeader>
              <div
                className="
                  mb-2
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-50
                  text-amber-600
                  dark:bg-amber-950/40
                  dark:text-amber-400
                "
              >
                <Archive className="h-5 w-5" />
              </div>

              <AlertDialogTitle
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Hifadhi taarifa hii?
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
                itaondolewa kwenye orodha ya ripoti
                zinazotumika sasa na kuhamishwa kwenye
                jarada. Inaweza kurejeshwa wakati wowote.
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
                  bg-amber-600
                  font-semibold
                  text-white
                  shadow-sm
                  hover:bg-amber-700
                  focus:ring-amber-500
                "
                onClick={(event) => {
                  event.preventDefault();

                  startTransition(handleDelete);
                }}
              >
                <Archive className="mr-2 h-4 w-4" />

                {isPending
                  ? "Inahifadhi..."
                  : "Hifadhi Taarifa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
