"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  Search,
  ShieldCheck,
} from "lucide-react";

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

import {
  trackingSchema,
  type TrackingInput,
} from "@/lib/schemas/tracking";

import { trackFeedback } from "@/lib/actions/tracking";

import type { FeedbackTracking } from "@/lib/types/tracking";

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

  async function onSubmit(values: TrackingInput) {
    setResult(null);
    setNotFound(false);

    startTransition(async () => {
      const response = await trackFeedback(values);

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
          "Taarifa imepatikana kikamilifu."
      );
    });
  }

  return (
    <>
      <Form {...form}>
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            shadow-slate-950/5
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* =================================================
              HEADER
          ================================================== */}
          <div
            className="
              border-b
              border-slate-100
              px-5
              py-5
              sm:px-6
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
                  text-purple-600
                  ring-1
                  ring-purple-100
                  dark:bg-purple-950/40
                  dark:text-purple-400
                  dark:ring-purple-900/50
                "
              >
                <Search className="h-5 w-5" />
              </div>

              {/* Heading */}
              <div className="min-w-0">
                <h2
                  className="
                    text-base
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-lg
                    dark:text-white
                  "
                >
                  Fuatilia Taarifa Yako
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Ingiza namba ya marejeleo ili kuona
                  maendeleo ya taarifa yako.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              FORM
          ================================================== */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
              space-y-6
              p-5
              sm:p-6
            "
          >
            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="
                      text-sm
                      font-semibold
                      text-slate-800
                      dark:text-slate-200
                    "
                  >
                    Namba ya Marejeleo
                  </FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Mfano: MLE-2026-0001"
                      autoComplete="off"
                      className="
                        mt-1.5
                        h-12
                        rounded-xl
                        border-slate-200
                        bg-slate-50/60
                        px-4
                        text-sm
                        shadow-none
                        transition-all
                        placeholder:text-slate-400
                        focus-visible:border-purple-500
                        focus-visible:ring-2
                        focus-visible:ring-purple-500/15
                        dark:border-slate-700
                        dark:bg-slate-800/60
                        dark:text-white
                        dark:placeholder:text-slate-500
                      "
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="
                h-11
                w-full
                rounded-xl
                bg-purple-600
                text-sm
                font-semibold
                text-white
                shadow-sm
                shadow-purple-600/20
                transition-all
                hover:bg-purple-700
                hover:shadow-md
                hover:shadow-purple-600/20
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:bg-purple-600
                dark:hover:bg-purple-700
              "
            >
              <Search className="mr-2 h-4 w-4" />

              {isPending
                ? "Inatafuta..."
                : "Fuatilia taarifa"}
            </Button>

            {/* Security Notice */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                border-t
                border-slate-100
                pt-5
                text-xs
                text-slate-500
                dark:border-slate-800
                dark:text-slate-400
              "
            >
              <ShieldCheck
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  text-emerald-600
                  dark:text-emerald-400
                "
              />

              <span>
                Taarifa zako zinalindwa na kuhifadhiwa
                kwa usalama.
              </span>
            </div>
          </form>
        </section>
      </Form>

      {/* ===================================================
          RESULT
      ==================================================== */}
      {result && (
        <TrackingResultCard
          feedback={result}
        />
      )}

      {/* ===================================================
          EMPTY / NOT FOUND
      ==================================================== */}
      {!result && notFound && (
        <TrackingEmptyState />
      )}
    </>
  );
}
