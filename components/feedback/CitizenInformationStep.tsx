"use client";

import { ArrowRight, UserRound } from "lucide-react";
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
  },
  {
    name: "phone" as const,
    label: "Namba ya simu",
    placeholder: "Mfano: 0712 345 678",
    type: "tel",
  },
  {
    name: "village" as const,
    label: "Kijiji",
    placeholder: "Andika kijiji chako",
  },
  {
    name: "ward" as const,
    label: "Kata",
    placeholder: "Andika kata yako",
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
        description="Tafadhali jaza taarifa zako kwa usahihi ili kurahisisha mawasiliano."
      />


      <div
        className="
          grid
          gap-x-6
          gap-y-5
          md:grid-cols-2
        "
      >

        {fields.map(
          ({
            name,
            label,
            placeholder,
            optional,
            type = "text",
          }) => (

            <FormField
              key={name}
              control={control}
              name={name}
              render={({ field }) => (

                <FormItem>

                  <FormLabel
                    className="
                      text-slate-800
                      dark:text-slate-200
                    "
                  >

                    {label}{" "}

                    {optional && (
                      <span
                        className="
                          font-normal
                          text-slate-400
                          dark:text-slate-500
                        "
                      >
                        (hiari)
                      </span>
                    )}

                  </FormLabel>


                  <FormControl>

                    <Input
                      {...field}
                      type={type}
                      placeholder={placeholder}
                      disabled={isPending}
                      className="
                        h-12
                        rounded-xl

                        border-slate-300
                        bg-white

                        text-slate-900

                        placeholder:text-slate-400

                        transition-all

                        focus-visible:border-[#006b3c]
                        focus-visible:ring-[#006b3c]


                        dark:border-slate-700
                        dark:bg-slate-900

                        dark:text-white

                        dark:placeholder:text-slate-500

                        dark:focus-visible:border-emerald-500
                        dark:focus-visible:ring-emerald-500
                      "
                    />

                  </FormControl>


                  {optional && (

                    <FormDescription
                      className="
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      Unaweza kuacha sehemu hii wazi.
                    </FormDescription>

                  )}


                  <FormMessage />

                </FormItem>

              )}
            />

          )
        )}

      </div>



      <div
        className="
          flex
          justify-end

          border-t
          border-slate-100

          pt-6

          dark:border-slate-800
        "
      >

        <Button
          type="button"
          size="lg"
          className="
            min-w-36

            rounded-xl

            bg-[#006b3c]

            px-6

            text-white

            hover:bg-[#005631]

            dark:bg-emerald-600

            dark:hover:bg-emerald-700
          "
          disabled={isPending}
          onClick={onNext}
        >

          Endelea

          <ArrowRight
            className="
              ml-1
              h-4
              w-4
            "
          />

        </Button>

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

    <div
      className="
        flex
        items-start
        gap-4
      "
    >

      <div
        className="
          flex
          h-12
          w-12
          shrink-0

          items-center
          justify-center

          rounded-xl

          bg-emerald-900/10

          text-[#006b3c]


          dark:bg-emerald-500/15

          dark:text-emerald-400
        "
      >

        <Icon className="h-6 w-6" />

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
          {title}
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
          {description}
        </p>


      </div>


    </div>

  );
}