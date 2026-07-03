"use client";

import { useState } from "react";
import { toast } from "sonner";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Server Action
import { createFeedback } from "@/lib/actions/feedback";

// Schema
import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/schemas/feedback";

// Components
import FeedbackSuccessCard from "@/components/feedback/FeedbackSuccessCard";

// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

export default function FeedbackForm() {
  /**
   * Success State
   */
  const [submittedFeedback, setSubmittedFeedback] =
    useState<{
      id: string;
      referenceNumber: string;
    } | null>(null);

  /**
   * React Hook Form
   */
  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      fullName: "",
      village: "",
      ward: "",
      phone: "",
      corruptionDescription: "",
      hasBribeRequest: false,
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = form;

  /**
   * Submit Handler
   */
  async function onSubmit(values: FeedbackInput) {
    try {
      const result = await createFeedback(values);

      if (!result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(
            ([field, messages]) => {
              if (!messages?.length) return;

              setError(field as keyof FeedbackInput, {
                type: "server",
                message: messages[0],
              });
            }
          );
        }

        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      setSubmittedFeedback(result.data);

      reset();
    } catch (error) {
      console.error(
        "[FeedbackForm] Submit Error:",
        error
      );

      toast.error(
        "Something went wrong while submitting your feedback."
      );
    }
  }

  /**
   * Success Screen
   */
  if (submittedFeedback) {
    return (
      <FeedbackSuccessCard
        referenceNumber={
          submittedFeedback.referenceNumber
        }
        onSubmitAnother={() => {
          setSubmittedFeedback(null);
          reset();
        }}
      />
    );
  }

  /**
   * Form UI
   */
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-10"
      >
                {/* =========================
            CITIZEN INFO
        ========================= */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Taarifa za Mwananchi
            </h2>

            <p className="text-sm text-muted-foreground">
              Tafadhali jaza taarifa zako kwa usahihi.
            </p>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jina Kamili</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mfano: Nicolaus Alex"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Village */}
            <FormField
              control={control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kijiji</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mfano: Usevya"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Ward */}
            <FormField
              control={control}
              name="ward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mfano: Inyonga"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Namba ya Simu</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="0712345678"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
                {/* =========================
            COMPLAINT INFO
        ========================= */}
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Taarifa ya Malalamiko
            </h2>

            <p className="text-sm text-muted-foreground">
              Eleza kwa kina kuhusu tukio la rushwa.
            </p>
          </div>

          <Separator />

          {/* Description */}
          <FormField
            control={control}
            name="corruptionDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maelezo</FormLabel>

                <FormControl>
                  <Textarea
                    className="min-h-32"
                    placeholder="Eleza kilichotokea..."
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Radio */}
          <FormField
            control={control}
            name="hasBribeRequest"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>
                  Je, uliombwa rushwa?
                </FormLabel>

                <FormControl>
                  <RadioGroup
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) =>
                      field.onChange(value === "true")
                    }
                    disabled={isSubmitting}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="true" />
                      <span>Ndiyo</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="false" />
                      <span>Hapana</span>
                    </div>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* =========================
            SUBMIT
        ========================= */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Inatuma..."
              : "Tuma Taarifa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}