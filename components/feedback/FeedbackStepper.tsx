"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Mwananchi",
    description: "Taarifa zako",
  },
  {
    id: 2,
    title: "Tukio",
    description: "Maelezo",
  },
  {
    id: 3,
    title: "Hakiki",
    description: "Tuma taarifa",
  },
];

interface FeedbackStepperProps {
  currentStep: number;
}

export default function FeedbackStepper({
  currentStep,
}: FeedbackStepperProps) {
  return (
    <div
      className="
        relative
        mx-auto
        w-full
        max-w-4xl
        px-1
      "
    >
      {/* Background progress line */}
      <div
        className="
          absolute
          left-[16.66%]
          right-[16.66%]
          top-6
          h-0.5
          overflow-hidden
          rounded-full
          bg-slate-200
          dark:bg-slate-800
        "
      >
        <motion.div
          className="
            h-full
            rounded-full
            bg-linear-to-r
            from-violet-600
            via-purple-600
            to-indigo-600
          "
          initial={false}
          animate={{
            width:
              currentStep === 1
                ? "0%"
                : currentStep === 2
                  ? "50%"
                  : "100%",
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>

      <ol
        className="
          relative
          grid
          grid-cols-3
          gap-4
        "
        aria-label="Hatua za kujaza fomu"
      >
        {steps.map((step) => {
          const completed = currentStep > step.id;
          const active = currentStep === step.id;

          return (
            <li
              key={step.id}
              className="flex flex-col items-center"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.08 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className={cn(
                  `
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    text-sm
                    font-bold
                    shadow-sm
                    transition-colors
                    duration-300
                  `,
                  completed &&
                    `
                      border-violet-600
                      bg-violet-600
                      text-white
                      shadow-lg
                      shadow-violet-600/20
                    `,
                  active &&
                    `
                      border-violet-600
                      bg-white
                      text-violet-700
                      ring-8
                      ring-violet-500/10
                      dark:bg-slate-950
                      dark:text-violet-400
                    `,
                  !active &&
                    !completed &&
                    `
                      border-slate-200
                      bg-white
                      text-slate-400
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-slate-500
                    `,
                )}
              >
                {completed ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  step.id
                )}
              </motion.div>

              <motion.div
                animate={{
                  y: active ? -1 : 0,
                }}
                transition={{ duration: 0.25 }}
                className="mt-3 text-center"
              >
                <p
                  className={cn(
                    "text-xs font-bold sm:text-sm",
                    active || completed
                      ? "text-violet-700 dark:text-violet-400"
                      : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {step.title}
                </p>

                <p className="mt-1 hidden text-xs text-slate-400 sm:block dark:text-slate-500">
                  {step.description}
                </p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}