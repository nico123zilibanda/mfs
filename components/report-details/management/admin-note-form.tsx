"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  Lock,
  Save,
  StickyNote,
} from "lucide-react";

import {
  feedbackNoteSchema,
  type FeedbackNoteInput,
} from "@/lib/schemas/feedback-note";

import {
  updateFeedbackNote,
} from "@/lib/actions/feedback-note";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Button,
} from "@/components/ui/button";

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
      feedbackNoteSchema
    ),

    defaultValues: {
      id: report.id,
      adminNote: report.adminNote ?? "",
    },
  });

  async function onSubmit(
    values: FeedbackNoteInput
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
                }
              );

            }
          );

        }

        toast.error(
          result.message ??
            "Failed to update admin note."
        );

        return;
      }

      toast.success(
        result.message ??
          "Admin note updated successfully."
      );

      router.refresh();

    });
  }

  return (
    <Card className="border-border shadow-sm">

      <CardHeader className="border-b border-border">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40">

            <StickyNote className="h-5 w-5 text-purple-700 dark:text-purple-400" />

          </div>

          <div>

            <CardTitle className="text-lg">
              Maelezo ya Msimamizi
            </CardTitle>

            <CardDescription>
              Ongeza maelezo ya ndani kuhusu taarifa hii.
            </CardDescription>

          </div>

        </div>

      </CardHeader>

      <CardContent className="space-y-6 pt-6">

        {/* Confidential Notice */}

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">

          <Lock className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />

          <div>

            <p className="font-medium text-foreground">
              Maelezo ya Ndani
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Maelezo haya yanaonekana kwa wasimamizi Tu.
            </p>

          </div>

        </div>

        <Form {...form}>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >

            <FormField
              control={form.control}
              name="adminNote"
              render={({ field }) => (

                <FormItem>

                  <FormLabel>
                    Maelezo ya Msimamizi
                  </FormLabel>

                  <FormControl>

                    <Textarea
                      rows={6}
                      disabled={isPending}
                      placeholder="Andika maelezo ya ndani kuhusu taarifa hii..."
                      {...field}
                      value={field.value ?? ""}
                    />

                  </FormControl>

                  <FormMessage />

                </FormItem>

              )}
            />

            <Button
              type="submit"
              disabled={
                isPending ||
                !form.formState.isDirty
              }
              className="
                w-full
                bg-purple-700
                hover:bg-purple-800
                dark:bg-purple-600
                dark:hover:bg-purple-700
              "
            >

              <Save className="mr-2 h-4 w-4" />

              {isPending
                ? "Inahifadhi..."
                : "Hifadhi Maelezo"}

            </Button>

          </form>

        </Form>

      </CardContent>

    </Card>
  );
}