"use client";

import { useState } from "react";
import { toast } from "sonner";

// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Server Action
import { createFeedback } from "@/lib/actions/feedback";

// Schema
import { feedbackSchema, type FeedbackInput } from "@/lib/schemas/feedback";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

export default function FeedbackForm() {
  /**
   * Success State
   */
  const [submittedFeedback, setSubmittedFeedback] = useState<{
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
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (!messages?.length) return;

            setError(field as keyof FeedbackInput, {
              type: "server",
              message: messages[0],
            });
          });
        }

        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      setSubmittedFeedback(result.data);

      reset();
    } catch (error) {
      console.error("[FeedbackForm] Submit Error:", error);

      toast.error("Something went wrong while submitting your feedback.");
    }
  }

  /**
   * Success Screen
   */
  if (submittedFeedback) {
    return (
      <FeedbackSuccessCard
        referenceNumber={submittedFeedback.referenceNumber}
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* =========================
    CITIZEN INFO
========================= */}
        <Card className="border-primary/15 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>

              <div>
                <CardTitle>Taarifa za Mwananchi</CardTitle>

                <CardDescription>
                  Tafadhali jaza taarifa zako kwa usahihi.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
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
                        className="h-11"
                        placeholder="Andika Majina Yako"
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
                        className="h-11"
                        placeholder="kijiji"
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
                        className="h-11"
                        placeholder="kata"
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
                        className="h-11"
                        type="tel"
                        placeholder="0xxxxxxxxx"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* =========================
    COMPLAINT INFO
========================= */}
        <Card className="border-primary/15 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <div>
                <CardTitle>Taarifa ya Malalamiko</CardTitle>

                <CardDescription>
                  Eleza kwa kina kuhusu tukio unaloripoti.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="space-y-6 pt-6">
            {/* Description */}
            <FormField
              control={control}
              name="corruptionDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maelezo ya Tukio</FormLabel>

                  <FormControl>
                    <Textarea
                      className="min-h-40"
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
                <FormItem className="space-y-4">
                  <FormLabel>Je, uliombwa kutoa rushwa?</FormLabel>

                  <FormControl>
                    <RadioGroup
                      value={field.value ? "true" : "false"}
                      onValueChange={(value) =>
                        field.onChange(value === "true")
                      }
                      disabled={isSubmitting}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 rounded-lg border p-4">
                        <RadioGroupItem value="true" />
                        <div>
                          <p className="font-medium">Ndiyo</p>

                          <p className="text-sm text-muted-foreground">
                            Niliombwa kutoa rushwa.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 rounded-lg border p-4">
                        <RadioGroupItem value="false" />
                        <div>
                          <p className="font-medium">Hapana</p>

                          <p className="text-sm text-muted-foreground">
                            Sikuombwa kutoa rushwa.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {/* =========================
    SUBMIT
========================= */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto md:min-w-72"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inatuma taarifa..." : "Tuma Taarifa"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
