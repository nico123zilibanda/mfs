"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { Save } from "lucide-react";

import {
  feedbackStatusSchema,
  type FeedbackStatusInput,
} from "@/lib/schemas/feedback-status";

import { updateFeedbackStatus } from "@/lib/actions/feedback-status";

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
    label: "Received",
  },
  {
    value: "in_review",
    label: "In Review",
  },
  {
    value: "resolved",
    label: "Resolved",
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
      feedbackStatusSchema
    ),

    defaultValues: {
      id: report.id,
      status: report.status,
    },
  });

  async function onSubmit(
    values: FeedbackStatusInput
  ) {
    startTransition(async () => {
      const result =
        await updateFeedbackStatus(values);

      if (!result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) {
                return;
              }

              form.setError(
                field as keyof FeedbackStatusInput,
                {
                  message: messages[0],
                }
              );
            }
          );
        }

        toast.error(
          result.message ??
            "Failed to update status."
        );

        return;
      }

      toast.success(
        result.message ??
          "Status updated successfully."
      );

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">
          Status
        </h3>

        <CardDescription>
          Update the current status of
          this report.
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Report Status
                </FormLabel>

                <Select
                  value={field.value}
                  onValueChange={
                    field.onChange
                  }
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <SelectItem
                          key={
                            status.value
                          }
                          value={
                            status.value
                          }
                        >
                          {status.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
          >
            <Save className="mr-2 h-4 w-4" />

            {isPending
              ? "Saving..."
              : "Save Status"}
          </Button>
        </form>
      </Form>
    </div>
  );
}