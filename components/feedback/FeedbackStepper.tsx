import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Mwananchi", description: "Taarifa zako" },
  { id: 2, title: "Tukio", description: "Maelezo" },
  { id: 3, title: "Hakiki", description: "Tuma taarifa" },
];

interface FeedbackStepperProps {
  currentStep: number;
}

export default function FeedbackStepper({ currentStep }: FeedbackStepperProps) {
  return (
    <ol className="flex items-start" aria-label="Hatua za kujaza fomu">
      {steps.map((step, index) => {
        const completed = currentStep > step.id;
        const active = currentStep === step.id;

        return (
          <li key={step.id} className="flex flex-1 items-start last:flex-none">
            <div className="flex min-w-0 flex-col items-center text-center">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                completed && "border-[#006b3c] bg-[#006b3c] text-white",
                active && "border-[#006b3c] bg-emerald-50 text-[#006b3c] ring-4 ring-emerald-900/10",
                !active && !completed && "border-slate-200 bg-white text-slate-400",
              )}>
                {completed ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className={cn("mt-3 text-xs font-semibold sm:text-sm", active || completed ? "text-[#006b3c]" : "text-slate-500")}>{step.title}</span>
              <span className="hidden text-xs text-slate-400 sm:block">{step.description}</span>
            </div>
            {index < steps.length - 1 && <div className={cn("mt-5 mx-3 h-px flex-1 sm:mx-5", completed ? "bg-[#006b3c]" : "bg-slate-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
