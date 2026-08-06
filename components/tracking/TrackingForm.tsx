
"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  trackingSchema,
  type TrackingInput,
} from "@/lib/schemas/tracking";

import { trackFeedback } from "@/lib/actions/tracking";

import type { FeedbackTracking } from "@/lib/types/tracking";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import TrackingEmptyState from "@/components/tracking/TrackingEmptyState";
import TrackingResultCard from "@/components/tracking/TrackingResultCard";

import { Search } from "lucide-react";

export default function TrackingForm() {
  const [result, setResult] =
    useState<FeedbackTracking | null>(null);

  const [notFound, setNotFound] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const form = useForm<TrackingInput>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      referenceNumber: "",
    },
  });

  async function onSubmit(
    values: TrackingInput
  ) {
    setResult(null);
    setNotFound(false);

    startTransition(async () => {
      const response =
        await trackFeedback(values);

      if (!response.success) {
        if (response.errors) {
          Object.entries(response.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) {
                return;
              }

              form.setError(
                field as keyof TrackingInput,
                {
                  message: messages[0],
                }
              );
            }
          );
        }

        setNotFound(true);

        toast.error(response.message);

        return;
      }

      setResult(response.data);

      toast.success(
        response.message ??
          "Feedback found successfully."
      );
    });
  }

  return (
    <>
      <Form {...form}>
        <section className="space-y-6">
          <form
            onSubmit={form.handleSubmit(
              onSubmit
            )}
            className="space-y-6 p-4 sm:p-6"
          >
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left text-slate-800">
                    Namba ya Marejeleo
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Mfano: MLE-2026-0001"
                      disabled={isPending}
                      className="h-12 border-slate-300 bg-white text-base focus-visible:ring-[#006b3c]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-12 w-full bg-[#006b3c] text-base hover:bg-[#005631]"
              disabled={isPending}
            >
              <Search className="mr-2 h-4 w-4" />

              {isPending
                ? "Inatafuta..."
                : "Fuatilia taarifa"}
            </Button>
          </form>
        </section>
      </Form>

      {result && (
        <TrackingResultCard
          feedback={result}
        />
      )}

      {!result && notFound && (
        <TrackingEmptyState />
      )}
    </>
  );
}
