"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import type { Control } from "react-hook-form";

import type { FeedbackInput } from "@/lib/schemas/feedback";

import { Button } from "@/components/ui/button";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

interface CitizenInformationStepProps {
  control: Control<FeedbackInput>;
  isPending: boolean;
  onNext: () => void;
}

const fields = [
  {
    name: "fullName" as const,
    label: "Jina kamili",
    placeholder: "Andika majina yako",
    optional: true,
    icon: UserRound,
  },
  {
    name: "phone" as const,
    label: "Namba ya simu",
    placeholder: "+255 xxx xxx xxx",
    type: "tel",
    icon: Phone,
  },
  {
    name: "village" as const,
    label: "Kijiji",
    placeholder: "Andika kijiji chako",
    icon: MapPin,
  },
  {
    name: "ward" as const,
    label: "Kata",
    placeholder: "Andika kata yako",
    icon: MapPin,
  },
];

export default function CitizenInformationStep({
  control,
  isPending,
  onNext,
}: CitizenInformationStepProps) {
  return (
    <div className="space-y-8">
      <StepHeading
        icon={UserRound}
        title="Taarifa za mwananchi"
        description="Tujulishe taarifa chache kuhusu wewe ili tuweze kufuatilia taarifa yako."
      />

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map(
          ({
            name,
            label,
            placeholder,
            optional,
            type = "text",
            icon: Icon,
          }) => (
            <FormField
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {label}

                    {optional && (
                      <span className="ml-1.5 font-normal text-slate-400">
                        (hiari)
                      </span>
                    )}
                  </FormLabel>

                  <FormControl>
                    <div className="group relative">
                      <Icon
                        className="
                          absolute
                          left-4
                          top-1/2
                          z-10
                          h-4
                          w-4
                          -translate-y-1/2
                          text-slate-400
                          transition-colors
                          group-focus-within:text-violet-600
                          dark:text-slate-500
                          dark:group-focus-within:text-violet-400
                        "
                      />

                      <Input
                        {...field}
                        type={type}
                        placeholder={placeholder}
                        disabled={isPending}
                        className="
                          h-14
                          rounded-2xl
                          border-slate-200
                          bg-slate-50/70
                          pl-11
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
                          dark:text-white

                          dark:hover:border-slate-700
                          dark:hover:bg-slate-900

                          dark:focus-visible:border-violet-500
                          dark:focus-visible:bg-slate-900
                          dark:focus-visible:ring-violet-500/10
                        "
                      />
                    </div>
                  </FormControl>

                  {optional && (
                    <FormDescription className="text-xs text-slate-400">
                      Unaweza kuacha sehemu hii wazi.
                    </FormDescription>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          ),
        )}
      </div>

      <div
        className="
          flex
          items-center
          justify-end
          border-t
          border-slate-100
          pt-6
          dark:border-slate-800
        "
      >
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
              min-w-36
              rounded-xl
              bg-violet-600
              px-6
              font-semibold
              text-white
              shadow-lg
              shadow-violet-600/20
              transition-all
              hover:bg-violet-700
              hover:shadow-xl
              hover:shadow-violet-600/25
            "
          >
            Endelea

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function StepHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
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
        <Icon className="h-5 w-5" />
      </motion.div>

      <div>
        <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h3>

        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}