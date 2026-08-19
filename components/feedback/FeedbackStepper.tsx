import { Check } from "lucide-react";

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
    <ol
      className="
        flex
        w-full
        items-start
      "

      aria-label="Hatua za kujaza fomu"
    >

      {steps.map(
        (step, index) => {

          const completed =
            currentStep > step.id;

          const active =
            currentStep === step.id;


          return (

            <li
              key={step.id}

              className="
                flex
                flex-1
                items-start

                last:flex-none
              "
            >

              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  items-center
                  text-center
                "
              >


                {/* Step circle */}

                <div
                  className={cn(
                    `
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center

                      rounded-full

                      border

                      text-sm
                      font-bold

                      transition-all
                      duration-300
                    `,

                    completed &&
                      `
                        border-[#006b3c]
                        bg-[#006b3c]
                        text-white

                        shadow-md
                        shadow-emerald-900/20
                      `,


                    active &&
                      `
                        border-[#006b3c]

                        bg-emerald-50
                        text-[#006b3c]

                        ring-4
                        ring-emerald-900/10

                        dark:bg-emerald-950/40
                      `,


                    !active &&
                      !completed &&
                      `
                        border-slate-200
                        bg-white
                        text-slate-400

                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-slate-500
                      `
                  )}
                >

                  {completed ? (
                    <Check
                      className="
                        h-5
                        w-5
                      "
                    />
                  ) : (
                    step.id
                  )}

                </div>



                {/* Title */}

                <span
                  className={cn(
                    `
                      mt-3

                      text-xs
                      font-semibold

                      sm:text-sm
                    `,

                    active || completed
                      ?
                      `
                        text-[#006b3c]
                        dark:text-emerald-400
                      `
                      :
                      `
                        text-slate-500
                        dark:text-slate-400
                      `
                  )}
                >

                  {step.title}

                </span>



                {/* Description */}

                <span
                  className="
                    mt-1

                    hidden

                    text-xs

                    text-slate-400

                    sm:block

                    dark:text-slate-500
                  "
                >

                  {step.description}

                </span>


              </div>



              {/* Connector */}

              {index < steps.length - 1 && (

                <div
                  className={cn(
                    `
                      mx-3

                      mt-5

                      h-0.5

                      flex-1

                      rounded-full

                      transition-colors

                      sm:mx-5
                    `,

                    completed
                      ?
                      `
                        bg-[#006b3c]
                      `
                      :
                      `
                        bg-slate-200

                        dark:bg-slate-700
                      `
                  )}
                />

              )}


            </li>

          );

        }
      )}

    </ol>
  );
}