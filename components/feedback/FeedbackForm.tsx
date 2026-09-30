"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { submitFeedback } from "@/lib/actions/create-feedback";
import {
  feedbackSchema,
  type FeedbackInput,
} from "@/lib/schemas/feedback";

import { Form } from "@/components/ui/form";

import CitizenInformationStep from "./CitizenInformationStep";
import ComplaintInformationStep from "./ComplaintInformationStep";
import FeedbackStepper from "./FeedbackStepper";
import FeedbackSuccessCard from "./FeedbackSuccessCard";
import ReviewInformationStep from "./ReviewInformationStep";

const stepVariants = {
  initial: {
    opacity: 0,
    x: 24,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    x: -24,
    filter: "blur(4px)",
  },
};

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

  const {
    control,
    trigger,
    getValues,
    handleSubmit,
    reset,
    setError,
  } = form;

  async function advanceToCitizenDetails() {
    const valid = await trigger([
      "fullName",
      "village",
      "ward",
      "phone",
    ]);

    if (valid) {
      setStep(2);
    }
  }

  async function advanceToReview() {
    const valid = await trigger([
      "corruptionDescription",
      "hasBribeRequest",
    ]);

    if (valid) {
      setStep(3);
    }
  }

  async function onSubmit(values: FeedbackInput) {
    startTransition(async () => {
      try {
        const result = await submitFeedback(values);

        if (!result.success) {
          Object.entries(result.errors ?? {}).forEach(
            ([field, messages]) => {
              if (messages?.[0]) {
                setError(field as keyof FeedbackInput, {
                  type: "server",
                  message: messages[0],
                });
              }
            },
          );

          toast.error(
            result.message ?? "Taarifa haikuweza kutumwa.",
          );

          return;
        }

        toast.success(
          result.message ?? "Taarifa imetumwa kwa mafanikio.",
        );

        setSubmittedFeedback(result.data);
        reset();
      } catch {
        toast.error(
          "Hitilafu imetokea. Tafadhali jaribu tena.",
        );
      }
    });
  }

  if (submittedFeedback) {
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
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FeedbackStepper currentStep={step} />

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-slate-200/80
            bg-white
            shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]
            dark:border-slate-800
            dark:bg-slate-950
          "
        >
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-linear-to-r
              from-violet-600
              via-purple-600
              to-indigo-600
            "
          />

          <div className="p-5 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </form>
    </Form>
  );
}