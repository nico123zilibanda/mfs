"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";
import type { Control } from "react-hook-form";

import type { FeedbackInput } from "@/lib/schemas/feedback";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { Textarea } from "@/components/ui/textarea";

interface ComplaintInformationStepProps {
  control: Control<FeedbackInput>;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function ComplaintInformationStep({
  control,
  isPending,
  onBack,
  onNext,
}: ComplaintInformationStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <StepHeader />

      {/* Complaint description */}
      <FormField
        control={control}
        name="corruptionDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Maelezo ya taarifa
            </FormLabel>

            <FormControl>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.05,
                }}
                className="group relative"
              >
                <Textarea
                  {...field}
                  disabled={isPending}
                  placeholder="Eleza kilichotokea kwa ufupi na kwa uwazi. Unaweza kutaja tarehe, eneo, taasisi/ofisi, huduma uliyoihitaji na hatua ulizochukua."
                  className="
                    min-h-52
                    resize-y
                    rounded-2xl
                    border-slate-200
                    bg-slate-50/70
                    p-5
                    leading-7
                    text-slate-900
                    shadow-sm
                    transition-all
                    duration-200

                    placeholder:text-slate-400

                    hover:border-slate-300
                    hover:bg-white

                    focus-visible:border-violet-500
                    focus-visible:bg-white
                    focus-visible:ring-4
                    focus-visible:ring-violet-500/10

                    dark:border-slate-800
                    dark:bg-slate-900/60
                    dark:text-slate-100

                    dark:hover:border-slate-700
                    dark:hover:bg-slate-900

                    dark:focus-visible:border-violet-500
                    dark:focus-visible:bg-slate-900
                    dark:focus-visible:ring-violet-500/10
                  "
                />

                {/* Character count */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    bottom-3
                    right-4
                    rounded-md
                    bg-white/80
                    px-2
                    py-1
                    text-[11px]
                    font-medium
                    text-slate-400
                    backdrop-blur
                    dark:bg-slate-950/80
                  "
                >
                  {field.value?.length ?? 0} herufi
                </div>
              </motion.div>
            </FormControl>

            <FormMessage />

            {/* Writing guide */}
            <WritingGuide />
          </FormItem>
        )}
      />

      {/* Bribe question */}
      <FormField
        control={control}
        name="hasBribeRequest"
        render={({ field }) => (
          <FormItem>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.12,
              }}
            >
              <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Je, uliombwa kutoa rushwa?
              </FormLabel>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Chagua jibu linaloendana na tukio ulilolieleza.
              </p>

              <FormControl>
                <RadioGroup
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) =>
                    field.onChange(value === "true")
                  }
                  disabled={isPending}
                  className="mt-4 grid gap-4 sm:grid-cols-2"
                >
                  <Choice
                    value="true"
                    selected={field.value}
                    title="Ndiyo"
                    description="Niliombwa kutoa rushwa."
                    icon={ShieldCheck}
                  />

                  <Choice
                    value="false"
                    selected={!field.value}
                    title="Hapana"
                    description="Sikuombwa kutoa rushwa."
                    icon={Check}
                  />
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </motion.div>
          </FormItem>
        )}
      />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: 0.18,
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
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={onNext}
            className="
              h-12
              w-full
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

              sm:w-auto
            "
          >
            Endelea

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Step Header                                                                */
/* -------------------------------------------------------------------------- */

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
          rotate: -8,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          duration: 0.4,
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
          bg-violet-600
          text-white
          shadow-lg
          shadow-violet-600/20
        "
      >
        <FileText className="h-5 w-5" />
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
          Taarifa ya malalamiko
        </h3>

        <p
          className="
            mt-1.5
            max-w-2xl
            text-sm
            leading-6
            text-slate-500
            dark:text-slate-400
          "
        >
          Eleza kwa ufupi na kwa usahihi changamoto au malalamiko
          uliyokutana nayo katika kupata huduma.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Writing Guide                                                              */
/* -------------------------------------------------------------------------- */

function WritingGuide() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        height: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        height: "auto",
        y: 0,
      }}
      transition={{
        duration: 0.4,
        delay: 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        mt-4
        overflow-hidden
        rounded-2xl
        border
        border-violet-100
        bg-linear-to-br
        from-violet-50
        via-white
        to-indigo-50/50
        dark:border-violet-900/40
        dark:from-violet-950/30
        dark:via-slate-900
        dark:to-indigo-950/20
      "
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-violet-100
              text-violet-700
              dark:bg-violet-900/40
              dark:text-violet-300
            "
          >
            <Info className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Jinsi ya kuandika malalamiko yako
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Ili taarifa yako iwe rahisi kueleweka na kufanyiwa
              kazi, jaribu kutaja:
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <GuideItem>
            <strong>Taasisi/ofisi</strong> iliyohusika.
          </GuideItem>

          <GuideItem>
            <strong>Tarehe na eneo</strong> tukio lilipotokea.
          </GuideItem>

          <GuideItem>
            <strong>Huduma</strong> uliyokuwa unahitaji.
          </GuideItem>

          <GuideItem>
            <strong>Kilichotokea</strong> na changamoto
            uliyokutana nayo.
          </GuideItem>

          <GuideItem className="sm:col-span-2">
            <strong>Hatua ulizochukua</strong> kabla ya
            kuwasilisha malalamiko haya.
          </GuideItem>
        </div>

        <div
          className="
            mt-5
            rounded-xl
            border
            border-violet-100
            bg-white/80
            p-4
            dark:border-violet-900/40
            dark:bg-slate-950/50
          "
        >
          <p
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-violet-700
              dark:text-violet-300
            "
          >
            Mfano wa taarifa
          </p>

          <p
            className="
              mt-2
              text-sm
              leading-7
              text-slate-600
              dark:text-slate-400
            "
          >
            “Tarehe 15 Septemba 2026 nilifika katika Ofisi ya
            Wilaya kwa ajili ya kupata huduma ya .... Baada ya
            kufika, nilielekezwa kwa .... Hata hivyo, nilikumbana
            na changamoto ya .... Nilijaribu kutafuta ufumbuzi
            kupitia .... lakini tatizo halikutatuliwa.”
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function GuideItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        `
          flex
          items-start
          gap-2.5
          rounded-xl
          border
          border-slate-200/80
          bg-white/70
          p-3
          text-sm
          leading-6
          text-slate-600
          dark:border-slate-800
          dark:bg-slate-900/50
          dark:text-slate-400
        `,
        className,
      )}
    >
      <span
        className="
          mt-2
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          bg-violet-500
        "
      />

      <span>{children}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Choice Card                                                                */
/* -------------------------------------------------------------------------- */

function Choice({
  value,
  selected,
  title,
  description,
  icon: Icon,
}: {
  value: "true" | "false";
  selected: boolean;
  title: string;
  description: string;
  icon: typeof Check;
}) {
  return (
    <motion.label
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.985,
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
          cursor-pointer
          overflow-hidden
          rounded-2xl
          border
          p-5
          transition-all
          duration-200
        `,
        selected
          ? `
              border-violet-500
              bg-violet-50
              shadow-lg
              shadow-violet-500/10

              dark:border-violet-500
              dark:bg-violet-950/30
            `
          : `
              border-slate-200
              bg-white

              hover:border-violet-300
              hover:shadow-md

              dark:border-slate-800
              dark:bg-slate-900

              dark:hover:border-violet-700
            `,
      )}
    >
      {/* Selected accent */}
      {selected && (
        <motion.div
          layoutId="selected-choice-indicator"
          className="
            absolute
            inset-y-0
            left-0
            w-1
            bg-violet-600
          "
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      <RadioGroupItem
        value={value}
        className="
          mt-1
          shrink-0
          border-slate-300
          text-violet-600

          dark:border-slate-600
          dark:text-violet-400
        "
      />

      <div className="ml-3 flex min-w-0 flex-1 items-start gap-3">
        <motion.div
          animate={{
            scale: selected ? 1 : 0.94,
          }}
          className={cn(
            `
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition-colors
            `,
            selected
              ? `
                  bg-violet-600
                  text-white
                `
              : `
                  bg-slate-100
                  text-slate-500
                  dark:bg-slate-800
                  dark:text-slate-400
                `,
          )}
        >
          <Icon className="h-4 w-4" />
        </motion.div>

        <span className="min-w-0">
          <span className="block font-semibold text-slate-950 dark:text-white">
            {title}
          </span>

          <span className="mt-1 block text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </span>
        </span>
      </div>

      {selected && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            absolute
            right-4
            top-4
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-violet-600
            text-white
          "
        >
          <Check className="h-3 w-3" />
        </motion.div>
      )}
    </motion.label>
  );
}