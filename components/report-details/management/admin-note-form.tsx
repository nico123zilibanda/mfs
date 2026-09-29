"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  FileText,
  Lock,
  Save,
  StickyNote,
} from "lucide-react";

import {
  feedbackNoteSchema,
  type FeedbackNoteInput,
} from "@/lib/schemas/feedback-note";

import { updateFeedbackNote } from "@/lib/actions/feedback-note";

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

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

type AdminNoteFormProps = {
  report: Feedback;
};

export default function AdminNoteForm({
  report,
}: AdminNoteFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const form = useForm<FeedbackNoteInput>({
    resolver: zodResolver(
      feedbackNoteSchema,
    ),

    defaultValues: {
      id: report.id,
      adminNote: report.adminNote ?? "",
    },
  });

  async function onSubmit(
    values: FeedbackNoteInput,
  ) {
    startTransition(async () => {
      const result =
        await updateFeedbackNote(values);

      if (!result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) return;

              form.setError(
                field as keyof FeedbackNoteInput,
                {
                  message: messages[0],
                },
              );
            },
          );
        }

        toast.error(
          result.message ??
            "Imeshindikana kusasisha maelezo ya msimamizi.",
        );

        return;
      }

      toast.success(
        result.message ??
          "Maelezo ya msimamizi yamehifadhiwa.",
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
            <StickyNote className="h-5 w-5" />
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
              Maelezo ya Msimamizi
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
              Ongeza au sasisha maelezo ya ndani kuhusu
              taarifa hii.
            </CardDescription>

            {/* Reference */}
            <div
              className="
                mt-3
                inline-flex
                max-w-full
                items-center
                gap-2
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
              <FileText
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  text-slate-400
                  dark:text-slate-500
                "
              />

              <span
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-wide
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Taarifa
              </span>

              <span
                className="
                  truncate
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

      {/* Content */}
      <CardContent
        className="
          space-y-6
          p-5
          sm:p-6
        "
      >
        {/* Confidential Notice */}
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
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-amber-100
              text-amber-600
              dark:bg-amber-950/50
              dark:text-amber-400
            "
          >
            <Lock className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-sm
                font-semibold
                text-amber-900
                dark:text-amber-200
              "
            >
              Maelezo ya ndani
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
              Maelezo haya yanaonekana kwa wasimamizi
              pekee na hayataonyeshwa kwa mwananchi.
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="adminNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      font-semibold
                      text-slate-800
                      dark:text-slate-200
                    "
                  >
                    Maelezo ya Msimamizi
                  </FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={7}
                      disabled={isPending}
                      placeholder="Andika maelezo ya ndani kuhusu hatua zilizochukuliwa, ufuatiliaji unaohitajika, au taarifa nyingine muhimu kwa wasimamizi..."
                      className="
                        min-h-40
                        resize-y
                        rounded-xl
                        border-slate-300
                        bg-white
                        leading-7
                        shadow-sm
                        transition-all
                        placeholder:text-slate-400
                        focus-visible:border-purple-500
                        focus-visible:ring-purple-500/20
                        dark:border-slate-700
                        dark:bg-slate-950
                        dark:text-slate-100
                        dark:placeholder:text-slate-500
                      "
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Save Action */}
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
                disabled={
                  isPending ||
                  !form.formState.isDirty
                }
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
                  sm:min-w-45
                  dark:bg-purple-600
                  dark:hover:bg-purple-700
                "
              >
                <Save className="mr-2 h-4 w-4" />

                {isPending
                  ? "Inahifadhi..."
                  : "Hifadhi Maelezo"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
