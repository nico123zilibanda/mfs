"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Send,
  UserRound,
} from "lucide-react";

import type { FeedbackInput } from "@/lib/schemas/feedback";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewInformationStepProps {
  values: FeedbackInput;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ReviewInformationStep({
  values,
  isPending,
  onBack,
  onSubmit,
}: ReviewInformationStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex items-start gap-4"
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
            rotate: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.05,
            duration: 0.45,
            type: "spring",
            stiffness: 300,
            damping: 22,
          }}
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-emerald-500
            text-white
            shadow-lg
            shadow-emerald-500/20
          "
        >
          <CheckCircle2 className="h-6 w-6" />
        </motion.div>

        <div>
          <h3
            className="
              text-xl
              font-bold
              tracking-tight
              text-slate-950
              dark:text-white
            "
          >
            Hakiki taarifa zako
          </h3>

          <p
            className="
              mt-1.5
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            Hakikisha taarifa zote ni sahihi kabla ya kuzituma.
          </p>
        </div>
      </motion.div>

      {/* Confirmation notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: 0.08,
        }}
        className="
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-emerald-100
          bg-emerald-50/70
          p-4
          dark:border-emerald-900/40
          dark:bg-emerald-950/20
        "
      >
        <div
          className="
            mt-0.5
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-emerald-100
            text-emerald-600
            dark:bg-emerald-900/40
            dark:text-emerald-400
          "
        >
          <Check className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Taarifa iko tayari kutumwa
          </p>

          <p className="mt-1 text-sm leading-6 text-emerald-700/80 dark:text-emerald-300/70">
            Tafadhali kagua taarifa zako kwa mara ya mwisho
            kabla ya kuwasilisha.
          </p>
        </div>
      </motion.div>

      {/* Review content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-5"
      >
        {/* Citizen information */}
        <ReviewSection
          icon={UserRound}
          title="Taarifa za mwananchi"
          description="Taarifa zako za msingi"
        >
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <ReviewItem
              label="Jina kamili"
              value={values.fullName || "Haijawekwa"}
            />

            <ReviewItem
              label="Namba ya simu"
              value={values.phone || "Haijawekwa"}
            />

            <ReviewItem
              label="Kijiji"
              value={values.village || "Haijawekwa"}
            />

            <ReviewItem
              label="Kata"
              value={values.ward || "Haijawekwa"}
            />
          </div>
        </ReviewSection>

        {/* Complaint information */}
        <ReviewSection
          icon={FileText}
          title="Taarifa ya tukio"
          description="Maelezo ya malalamiko yako"
        >
          <div className="space-y-6">
            <ReviewItem
              label="Maelezo ya tukio"
              value={
                values.corruptionDescription ||
                "Haijawekwa"
              }
              multiline
            />

            <ReviewItem
              label="Uliombwa rushwa?"
              value={
                values.hasBribeRequest
                  ? "Ndiyo"
                  : "Hapana"
              }
              badge
              positive={values.hasBribeRequest}
            />
          </div>
        </ReviewSection>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: 0.28,
        }}
        className="
          flex
          flex-col-reverse
          gap-3
          border-t
          border-slate-100
          pt-6

          sm:flex-row
          sm:items-center
          sm:justify-between

          dark:border-slate-800
        "
      >
        <motion.div
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={onBack}
            className="
              h-12
              w-full
              rounded-xl
              border-slate-200
              bg-white
              px-6
              font-semibold
              text-slate-700
              shadow-sm
              transition-all

              hover:border-slate-300
              hover:bg-slate-50

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800

              sm:w-auto
            "
          >
            <ArrowLeft className="mr-2 h-4 w-4" />

            Rudi
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={onSubmit}
            className="
              relative
              h-12
              w-full
              overflow-hidden
              rounded-xl
              bg-violet-600
              px-7
              font-semibold
              text-white
              shadow-lg
              shadow-violet-600/20
              transition-all

              hover:bg-violet-700
              hover:shadow-xl
              hover:shadow-violet-600/25

              disabled:cursor-not-allowed
              disabled:opacity-70

              sm:w-auto
            "
          >
            {isPending ? (
              <>
                <span
                  className="
                    mr-2
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Inatuma taarifa...
              </>
            ) : (
              <>
                Tuma taarifa

                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Review Section                                                             */
/* -------------------------------------------------------------------------- */

function ReviewSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={{
        hidden: {
          opacity: 0,
          y: 14,
        },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        shadow-sm

        dark:border-slate-800
        dark:bg-slate-900/60
      "
    >
      {/* Section header */}
      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-slate-100
          bg-slate-50/70
          px-5
          py-4

          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-violet-100
            text-violet-700

            dark:bg-violet-950/50
            dark:text-violet-400
          "
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h4
            className="
              text-sm
              font-bold
              text-slate-950
              dark:text-white
            "
          >
            {title}
          </h4>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Section body */}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* Review Item                                                                */
/* -------------------------------------------------------------------------- */

function ReviewItem({
  label,
  value,
  multiline = false,
  badge = false,
  positive = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  badge?: boolean;
  positive?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 8,
        },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.25,
          },
        },
      }}
      className={cn(
        "min-w-0",
        multiline && "sm:col-span-2",
      )}
    >
      <p
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-widest
          text-slate-400
          dark:text-slate-500
        "
      >
        {label}
      </p>

      {badge ? (
        <div className="mt-2">
          <span
            className={cn(
              `
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                py-1.5
                text-sm
                font-semibold
              `,
              positive
                ? `
                    border-amber-200
                    bg-amber-50
                    text-amber-700
                    dark:border-amber-900/50
                    dark:bg-amber-950/30
                    dark:text-amber-300
                  `
                : `
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-700
                    dark:border-emerald-900/50
                    dark:bg-emerald-950/30
                    dark:text-emerald-300
                  `,
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                positive
                  ? "bg-amber-500"
                  : "bg-emerald-500",
              )}
            />

            {value}
          </span>
        </div>
      ) : (
        <p
          className={cn(
            `
              mt-2
              whitespace-pre-wrap
              text-sm
              leading-7
              text-slate-900
              dark:text-slate-100
            `,
            !multiline && "font-medium",
          )}
        >
          {value}
        </p>
      )}
    </motion.div>
  );
}