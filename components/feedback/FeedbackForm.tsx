"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { submitFeedback } from "@/lib/actions/create-feedback";
import { feedbackSchema, type FeedbackInput } from "@/lib/schemas/feedback";
import { Form } from "@/components/ui/form";

import CitizenInformationStep from "./CitizenInformationStep";
import ComplaintInformationStep from "./ComplaintInformationStep";
import FeedbackStepper from "./FeedbackStepper";
import FeedbackSuccessCard from "./FeedbackSuccessCard";
import ReviewInformationStep from "./ReviewInformationStep";

export default function FeedbackForm() {
  const [step, setStep] = useState(1);
  const [submittedFeedback, setSubmittedFeedback] = useState<{
    id: string;
    referenceNumber: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
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
  const { control, trigger, getValues, handleSubmit, reset, setError } = form;

  async function advanceToCitizenDetails() {
    if (await trigger(["fullName", "village", "ward", "phone"])) setStep(2);
  }
  async function advanceToReview() {
    if (await trigger(["corruptionDescription", "hasBribeRequest"])) setStep(3);
  }
  async function onSubmit(values: FeedbackInput) {
    startTransition(async () => {
      try {
        const result = await submitFeedback(values);
        if (!result.success) {
          Object.entries(result.errors ?? {}).forEach(([field, messages]) => {
            if (messages?.[0])
              setError(field as keyof FeedbackInput, {
                type: "server",
                message: messages[0],
              });
          });
          toast.error(result.message ?? "Taarifa haikuweza kutumwa.");
          return;
        }
        toast.success(result.message ?? "Taarifa imetumwa kwa mafanikio.");
        setSubmittedFeedback(result.data);
        reset();
      } catch {
        toast.error("Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }
  if (submittedFeedback)
    return (
      <FeedbackSuccessCard
        referenceNumber={submittedFeedback.referenceNumber}
        onSubmitAnother={() => {
          setSubmittedFeedback(null);
          setStep(1);
          reset();
        }}
      />
    );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 py-2 sm:py-4"
      >
        <FeedbackStepper currentStep={step} />
        <div className="border-t border-slate-100 pt-8">
          {step === 1 && (
            <CitizenInformationStep
              control={control}
              isPending={isPending}
              onNext={advanceToCitizenDetails}
            />
          )}
          {step === 2 && (
            <ComplaintInformationStep
              control={control}
              isPending={isPending}
              onBack={() => setStep(1)}
              onNext={advanceToReview}
            />
          )}
          {step === 3 && (
            <ReviewInformationStep
              values={getValues()}
              isPending={isPending}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit(onSubmit)}
            />
          )}
        </div>
      </form>
    </Form>
  );
}
