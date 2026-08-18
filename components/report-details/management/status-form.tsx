"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  Save,
  ClipboardCheck,
} from "lucide-react";

import {
  feedbackStatusSchema,
  type FeedbackStatusInput,
} from "@/lib/schemas/feedback-status";

import {
  updateFeedbackStatus,
} from "@/lib/actions/feedback-status";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Button,
} from "@/components/ui/button";

type StatusFormProps = {
  report: Feedback;
};

const STATUS_OPTIONS = [
  {
    value: "received",
    label: "Imepokelewa",
  },
  {
    value: "in_review",
    label: "Inachunguzwa",
  },
  {
    value: "resolved",
    label: "Imetatuliwa",
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
              if (!messages?.length) return;

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
            "Failed to update report status."
        );

        return;
      }

      toast.success(
        result.message ??
          "Report status updated successfully."
      );

      router.refresh();
    });
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
            <ClipboardCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>

          <div>
            <CardTitle className="text-lg">
              Hali ya Taarifa
            </CardTitle>

            <CardDescription>
              Sasisha hali ya sasa ya taarifa hii.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Chagua Hali
                  </FormLabel>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chagua hali..." />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {STATUS_OPTIONS.map(
                        (status) => (
                          <SelectItem
                            key={status.value}
                            value={status.value}
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
              className="w-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              <Save className="mr-2 h-4 w-4" />

              {isPending
                ? "Inahifadhi..."
                : "Hifadhi Mabadiliko"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}