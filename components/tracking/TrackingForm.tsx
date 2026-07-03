"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  trackingSchema,
  type TrackingInput,
} from "@/lib/schemas/tracking";

import { trackFeedbackByReference } from "@/lib/actions/tracking";

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

  const form = useForm<TrackingInput>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      referenceNumber: "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: {
      isSubmitting,
    },
  } = form;

  async function onSubmit(
    values: TrackingInput
  ) {
    setResult(null);
    setNotFound(false);

    try {
      const response =
        await trackFeedbackByReference(values);

      if (!response.success) {
        if (response.errors) {
          Object.entries(response.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) return;

              setError(
                field as keyof TrackingInput,
                {
                  type: "server",
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

      toast.success(response.message);
    } catch (error) {
      console.error(
        "[TrackingForm]",
        error
      );

      toast.error(
        "Hitilafu imetokea wakati wa kutafuta mrejesho."
      );
    }
  }

  return (
    <Form {...form}>
      <section className="space-y-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-4 py-4"
        >
          <FormField
            control={control}
            name="referenceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Namba ya Marejeleo
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Mfano: MLL-2026-000001"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            <Search className="mr-2 h-4 w-4" />

            {isSubmitting
              ? "Inatafuta..."
              : "Fuatilia Mrejesho"}
          </Button>
        </form>
      </section>

      {result && (
        <TrackingResultCard
          feedback={result}
        />
      )}

      {!result && notFound && (
        <TrackingEmptyState />
      )}
    </Form>
  );
}