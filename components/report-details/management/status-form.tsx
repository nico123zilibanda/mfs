"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  ClipboardCheck,
  Save,
} from "lucide-react";

import {
  feedbackStatusSchema,
  type FeedbackStatusInput,
} from "@/lib/schemas/feedback-status";

import { updateFeedbackStatus } from "@/lib/actions/feedback-status";

import type { Feedback } from "@/lib/types/feedback";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

type StatusFormProps = {
  report: Feedback;
};

const STATUS_OPTIONS = [
  {
    value: "received",
    label: "Imepokelewa",
    description: "Taarifa imepokelewa na mfumo.",
  },
  {
    value: "in_review",
    label: "Inachunguzwa",
    description: "Taarifa iko kwenye mchakato wa uchunguzi.",
  },
  {
    value: "resolved",
    label: "Imetatuliwa",
    description: "Taarifa imeshughulikiwa na kutatuliwa.",
  },
] as const;

export default function StatusForm({
  report,
}: StatusFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const form = useForm<FeedbackStatusInput>({
    resolver: zodResolver(
      feedbackStatusSchema,
    ),

    defaultValues: {
      id: report.id,
      status: report.status,
    },
  });

  async function onSubmit(
    values: FeedbackStatusInput,
  ) {
    startTransition(async () => {
      const result =
        await updateFeedbackStatus(values);

      if (!result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) return;

              form.setError(
                field as keyof FeedbackStatusInput,
                {
                  message: messages[0],
                },
              );
            },
          );
        }

        toast.error(
          result.message ??
            "Imeshindikana kusasisha hali ya taarifa.",
        );

        return;
      }

      toast.success(
        result.message ??
          "Hali ya taarifa imesasishwa.",
      );

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
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-800
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

      {/* Header */}
      <CardHeader
        className="
          border-b
          border-slate-100
          p-5
          sm:p-6
          dark:border-slate-800
        "
      >
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
            <ClipboardCheck className="h-5 w-5" />
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
              Hali ya Taarifa
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
              Sasisha hali ya sasa ya taarifa hii.
            </CardDescription>

            <div
              className="
                mt-3
                inline-flex
                items-center
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-2.5
                py-1.5
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <span
                className="
                  mr-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Taarifa
              </span>

              <span
                className="
                  font-mono
                  text-xs
                  font-semibold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                {report.referenceNumber}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Form */}
      <CardContent className="p-5 sm:p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const selectedStatus =
                  STATUS_OPTIONS.find(
                    (status) =>
                      status.value === field.value,
                  );

                return (
                  <FormItem>
                    <FormLabel
                      className="
                        font-semibold
                        text-slate-800
                        dark:text-slate-200
                      "
                    >
                      Chagua Hali
                    </FormLabel>

                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="
                            h-11
                            rounded-xl
                            border-slate-300
                            bg-white
                            shadow-sm
                            transition-colors
                            focus:ring-purple-500/20
                            dark:border-slate-700
                            dark:bg-slate-950
                          "
                        >
                          <SelectValue placeholder="Chagua hali..." />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="rounded-xl">
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="rounded-lg"
                            >
                              <div className="flex flex-col py-0.5">
                                <span className="font-medium">
                                  {status.label}
                                </span>

                                <span
                                  className="
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  {status.description}
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {/* Selected Status Preview */}
                    {selectedStatus && (
                      <div
                        className="
                          mt-3
                          rounded-xl
                          border
                          border-purple-100
                          bg-purple-50/70
                          px-4
                          py-3
                          dark:border-purple-900/40
                          dark:bg-purple-950/20
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-purple-600
                            dark:text-purple-400
                          "
                        >
                          Hali iliyochaguliwa
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            font-semibold
                            text-purple-900
                            dark:text-purple-200
                          "
                        >
                          {selectedStatus.label}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-xs
                            leading-5
                            text-purple-800/70
                            dark:text-purple-300/70
                          "
                        >
                          {selectedStatus.description}
                        </p>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Action */}
            <div
              className="
                border-t
                border-slate-100
                pt-5
                dark:border-slate-800
              "
            >
              <Button
                type="submit"
                disabled={isPending}
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
                  sm:w-auto
                  sm:min-w-48
                  dark:bg-purple-600
                  dark:hover:bg-purple-700
                "
              >
                <Save className="mr-2 h-4 w-4" />

                {isPending
                  ? "Inahifadhi..."
                  : "Hifadhi Mabadiliko"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
