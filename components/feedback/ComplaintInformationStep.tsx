"use client";

import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

      {/* Heading */}
      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-purple-900/10
            bg-purple-50
            text-[#6d28d9]
            dark:border-purple-400/20
            dark:bg-purple-950/40
            dark:text-purple-400
          "
        >
          <FileText className="h-6 w-6" />
        </div>

        <div>
          <h3
            className="
              text-xl
              font-bold
              text-slate-950
              dark:text-white
            "
          >
            Taarifa ya tukio
          </h3>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            Eleza kwa undani tukio, eneo lilipotokea na taarifa nyingine muhimu.
          </p>
        </div>
      </div>


      {/* Description */}
      <FormField
        control={control}
        name="corruptionDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              className="
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              Maelezo ya tukio
            </FormLabel>

            <FormControl>
              <Textarea
                {...field}
                disabled={isPending}
                placeholder="Eleza kilichotokea, eneo lilipotokea na taarifa nyingine muhimu..."
                className="
                  min-h-44
                  resize-y
                  rounded-xl
                  border-slate-300
                  bg-white
                  leading-7
                  transition-colors
                  placeholder:text-slate-400
                  focus-visible:ring-[#6d28d9]
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-100
                  dark:placeholder:text-slate-500
                "
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />


      {/* Bribe Question */}
      <FormField
        control={control}
        name="hasBribeRequest"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              className="
                font-semibold
                text-slate-800
                dark:text-slate-200
              "
            >
              Je, uliombwa kutoa rushwa?
            </FormLabel>

            <FormControl>
              <RadioGroup
                value={field.value ? "true" : "false"}
                onValueChange={(value) =>
                  field.onChange(value === "true")
                }
                disabled={isPending}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Choice
                  value="true"
                  selected={field.value}
                  title="Ndiyo"
                  description="Niliombwa kutoa rushwa."
                />

                <Choice
                  value="false"
                  selected={!field.value}
                  title="Hapana"
                  description="Sikuombwa kutoa rushwa."
                />
              </RadioGroup>
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />


      {/* Actions */}
      <div
        className="
          flex
          flex-col-reverse
          gap-3
          border-t
          border-slate-100
          pt-6
          sm:flex-row
          sm:justify-between
          dark:border-slate-800
        "
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="
            border-slate-300
            px-6
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-200
          "
          disabled={isPending}
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Rudi
        </Button>

        <Button
          type="button"
          size="lg"
          className="
            bg-[#6d28d9]
            px-6
            text-white
            hover:bg-[#4c1d95]
          "
          disabled={isPending}
          onClick={onNext}
        >
          Endelea
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}


function Choice({
  value,
  selected,
  title,
  description,
}: {
  value: "true" | "false";
  selected: boolean;
  title: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        `
          flex
          cursor-pointer
          items-start
          gap-3
          rounded-xl
          border
          p-4
          transition-all
        `,
        selected
          ? `
              border-[#6d28d9]
              bg-purple-50
              ring-1
              ring-[#6d28d9]
              dark:bg-purple-950/40
            `
          : `
              border-slate-200
              bg-white
              hover:border-purple-800/40
              dark:border-slate-700
              dark:bg-slate-900
              dark:hover:border-purple-500/50
            `,
      )}
    >
      <RadioGroupItem
        value={value}
        className="mt-0.5"
      />

      <span>
        <span
          className="
            block
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </span>

        <span
          className="
            mt-1
            block
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          {description}
        </span>
      </span>
    </label>
  );
}