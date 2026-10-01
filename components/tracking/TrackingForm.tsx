"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  Search,
  ShieldCheck,
  ArrowRight,
  Loader2,
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

const ease = [0.22, 1, 0.36, 1] as const;

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
    <Form {...form}>
      <div className="space-y-5">
        {/* =================================================
            TRACKING CARD
        ================================================== */}
        <motion.section
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
            ease,
          }}
          className="
            relative
            overflow-hidden
            rounded-3xl

            border
            border-slate-200/80

            bg-white

            shadow-xl
            shadow-slate-950/5

            dark:border-slate-800
            dark:bg-slate-950
            dark:shadow-black/20
          "
        >
          {/* Top accent */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-0
              top-0
              h-1

              bg-linear-to-r
              from-violet-600
              via-purple-500
              to-indigo-500
            "
          />

          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20

              h-40
              w-40

              rounded-full

              bg-purple-500/10

              blur-3xl

              dark:bg-purple-500/5
            "
          />

          {/* =================================================
              HEADER
          ================================================== */}
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.08,
              ease,
            }}
            className="
              relative

              border-b
              border-slate-100

              px-5
              py-6

              sm:px-7
              sm:py-7

              dark:border-slate-800
            "
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.15,
                  ease,
                }}
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center

                  rounded-2xl

                  bg-purple-50
                  text-purple-600

                  shadow-sm

                  ring-1
                  ring-purple-100

                  dark:bg-purple-950/50
                  dark:text-purple-400
                  dark:ring-purple-900/50
                "
              >
                <Search className="h-5 w-5" />
              </motion.div>

              {/* Heading */}
              <div className="min-w-0 pt-0.5">
                <h2
                  className="
                    text-lg
                    font-bold
                    tracking-tight

                    text-slate-950

                    sm:text-xl

                    dark:text-white
                  "
                >
                  Fuatilia Taarifa Yako
                </h2>

                <p
                  className="
                    mt-1.5
                    max-w-xl

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
          </motion.div>

          {/* =================================================
              FORM
          ================================================== */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
              relative
              space-y-6

              p-5

              sm:p-7
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.18,
                ease,
              }}
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
                      <div className="relative mt-1.5">
                        <Search
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            z-10
                            h-4
                            w-4
                            -translate-y-1/2

                            text-slate-400

                            transition-colors

                            peer-focus:text-purple-600

                            dark:text-slate-500
                            dark:peer-focus:text-purple-400
                          "
                        />

                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Mfano: MLE-2026-0001"
                          autoComplete="off"
                          className="
                            peer

                            h-13
                            rounded-2xl

                            border
                            border-slate-200

                            bg-slate-50/70

                            pl-11
                            pr-4

                            text-sm
                            font-medium

                            shadow-none

                            transition-all
                            duration-200

                            placeholder:text-slate-400

                            hover:border-slate-300

                            focus-visible:border-purple-500
                            focus-visible:bg-white
                            focus-visible:ring-4
                            focus-visible:ring-purple-500/10

                            dark:border-slate-700
                            dark:bg-slate-900/70
                            dark:text-white
                            dark:placeholder:text-slate-500

                            dark:hover:border-slate-600

                            dark:focus-visible:border-purple-500
                            dark:focus-visible:bg-slate-900
                            dark:focus-visible:ring-purple-500/10
                          "
                        />
                      </div>
                    </FormControl>

                    <FormMessage className="pt-1" />
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: 0.24,
                ease,
              }}
            >
              <Button
                type="submit"
                disabled={isPending}
                className="
                  group

                  h-12
                  w-full

                  rounded-2xl

                  bg-purple-600

                  text-sm
                  font-semibold
                  text-white

                  shadow-lg
                  shadow-purple-600/20

                  transition-all
                  duration-200

                  hover:bg-purple-700
                  hover:shadow-xl
                  hover:shadow-purple-600/25

                  active:scale-[0.99]

                  disabled:cursor-not-allowed
                  disabled:opacity-70

                  dark:bg-purple-600
                  dark:hover:bg-purple-700
                "
              >
                {isPending ? (
                  <>
                    <Loader2
                      className="
                        mr-2
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Inatafuta...
                  </>
                ) : (
                  <>
                    <Search
                      className="
                        mr-2
                        h-4
                        w-4
                      "
                    />

                    Fuatilia taarifa

                    <ArrowRight
                      className="
                        ml-2
                        h-4
                        w-4

                        transition-transform
                        duration-200

                        group-hover:translate-x-0.5
                      "
                    />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.3,
              }}
              className="
                flex
                items-center
                justify-center
                gap-2

                border-t
                border-slate-100

                pt-5

                text-xs
                leading-5

                text-slate-500

                dark:border-slate-800
                dark:text-slate-400
              "
            >
              <ShieldCheck
                className="
                  h-4
                  w-4
                  shrink-0

                  text-emerald-600

                  dark:text-emerald-400
                "
              />

              <span>
                Taarifa zako zinalindwa na kuhifadhiwa
                kwa usalama.
              </span>
            </motion.div>
          </form>
        </motion.section>

        {/* =================================================
            RESULT / EMPTY STATE
        ================================================== */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="tracking-result"
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.45,
                ease,
              }}
            >
              <TrackingResultCard
                feedback={result}
              />
            </motion.div>
          )}

          {!result && notFound && (
            <motion.div
              key="tracking-empty"
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.4,
                ease,
              }}
            >
              <TrackingEmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Form>
  );
}