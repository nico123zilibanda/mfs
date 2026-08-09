"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { Save } from "lucide-react";

import {
  feedbackNoteSchema,
  type FeedbackNoteInput,
} from "@/lib/schemas/feedback-note";

import { updateFeedbackNote } from "@/lib/actions/feedback-note";

import type { Feedback } from "@/lib/types/feedback";

import { CardDescription } from "@/components/ui/card";

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
              if (!messages?.length) {
                return;
              }

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
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-green-700">
          Admin Note
        </h3>

        <CardDescription>
          Add internal notes for this
          report. These notes are only
          visible to administrators.
        </CardDescription>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="adminNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Internal Note
                </FormLabel>

                <FormControl>
                  <Textarea
                    placeholder="Write an internal note..."
                    rows={5}
                    disabled={isPending}
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
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />

            {isPending
              ? "Saving..."
              : "Save Note"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
