"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

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
          result.message ??
            "Imeshindikana kurejesha taarifa.",
        );

        return;
      }

      toast.success(
        result.message ??
          "Taarifa imerejeshwa kikamilifu.",
      );

      router.replace(`/all-reports/${report.id}`);
      router.refresh();
    });
  }

  return (
    <Card
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-purple-200
        bg-white
        shadow-sm
        dark:border-purple-900/50
        dark:bg-slate-900
      "
    >
      {/* Primary Accent */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          h-1
          bg-linear-to-r
          from-purple-500
          via-[#6d28d9]
          to-indigo-500
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
              bg-purple-50
              text-[#6d28d9]
              ring-1
              ring-purple-100
              dark:bg-purple-950/40
              dark:text-purple-300
              dark:ring-purple-900/50
            "
          >
            <ShieldCheck className="h-5 w-5" />
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
              Rejesha taarifa
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
              Rudisha taarifa hii kwenye orodha ya taarifa
              zinazotumika.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Status Notice */}
        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-purple-100
            bg-purple-50/70
            p-4
            dark:border-purple-900/40
            dark:bg-purple-950/20
          "
        >
          <ShieldCheck
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-purple-600
              dark:text-purple-400
            "
          />

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-purple-900
                dark:text-purple-200
              "
            >
              Taarifa imehifadhiwa kwenye jarada
            </p>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-purple-800/80
                dark:text-purple-300/80
              "
            >
              Kurejesha taarifa hii kutaifanya ionekane tena
              kwenye orodha ya taarifa zinazotumika.
            </p>
          </div>
        </div>

        {/* Restore Action */}
        <Button
          type="button"
          disabled={isPending}
          onClick={handleRestore}
          className="
            w-full
            rounded-xl
            bg-[#6d28d9]
            font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-[#5b21b6]
            focus-visible:ring-[#6d28d9]
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:bg-purple-600
            dark:hover:bg-purple-700
          "
        >
          <RotateCcw className="mr-2 h-4 w-4" />

          {isPending
            ? "Inarejesha..."
            : "Rejesha Taarifa"}

          {!isPending && (
            <ArrowRight className="ml-auto h-4 w-4 opacity-70" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
