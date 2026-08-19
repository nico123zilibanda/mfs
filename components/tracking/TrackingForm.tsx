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

import {
  Search,
  ShieldCheck,
} from "lucide-react";


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

          Object.entries(response.errors)
            .forEach(([field, messages]) => {

              if (!messages?.length) {
                return;
              }


              form.setError(
                field as keyof TrackingInput,
                {
                  message: messages[0],
                }
              );

            });

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

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-lg
            shadow-emerald-950/5

            dark:border-slate-800
            dark:bg-slate-950
          "
        >

          <div
            className="
              border-b
              border-slate-100
              bg-emerald-50/60
              px-5
              py-4

              dark:border-slate-800
              dark:bg-emerald-950/20
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#006b3c]
                  text-white
                "
              >

                <Search
                  className="
                    h-5
                    w-5
                  "
                />

              </div>


              <div>

                <h3
                  className="
                    font-bold
                    text-slate-950

                    dark:text-white
                  "
                >
                  Fuatilia Taarifa Yako
                </h3>


                <p
                  className="
                    text-sm
                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  Ingiza namba ya kumbukumbu uliyopewa.
                </p>

              </div>


            </div>

          </div>



          <form
            onSubmit={
              form.handleSubmit(onSubmit)
            }
            className="
              space-y-6
              p-5

              sm:p-8
            "
          >


            <FormField
              control={form.control}
              name="referenceNumber"

              render={({ field }) => (

                <FormItem>


                  <FormLabel
                    className="
                      font-semibold
                      text-slate-800

                      dark:text-slate-200
                    "
                  >
                    Namba ya Marejeleo
                  </FormLabel>


                  <FormControl>

                    <Input
                      placeholder="Mfano: MLE-2026-0001"

                      disabled={isPending}

                      className="
                        h-12
                        rounded-xl
                        border-slate-300
                        bg-white
                        text-base

                        placeholder:text-slate-400

                        focus-visible:ring-[#006b3c]

                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-white
                      "

                      {...field}
                    />

                  </FormControl>


                  <FormMessage />


                </FormItem>

              )}

            />



            <Button
              type="submit"

              disabled={isPending}

              className="
                h-12
                w-full
                rounded-xl
                bg-[#006b3c]
                text-base
                font-semibold
                text-white

                hover:bg-[#005631]

                dark:bg-emerald-600
                dark:hover:bg-emerald-700
              "
            >

              <Search
                className="
                  mr-2
                  h-4
                  w-4
                "
              />


              {isPending
                ? "Inatafuta..."
                : "Fuatilia taarifa"}

            </Button>



            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                text-xs
                text-slate-500

                dark:text-slate-400
              "
            >

              <ShieldCheck
                className="
                  h-4
                  w-4
                  text-[#006b3c]
                "
              />

              Taarifa zako zinalindwa kwa usalama.

            </div>


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