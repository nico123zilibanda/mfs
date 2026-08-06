"use client";

import { ArrowRight, UserRound } from "lucide-react";
import type { Control } from "react-hook-form";

import type { FeedbackInput } from "@/lib/schemas/feedback";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CitizenInformationStepProps {
  control: Control<FeedbackInput>;
  isPending: boolean;
  onNext: () => void;
}

const fields = [
  { name: "fullName" as const, label: "Jina kamili", placeholder: "Andika majina yako", optional: true },
  { name: "phone" as const, label: "Namba ya simu", placeholder: "Mfano: 0712 345 678", type: "tel" },
  { name: "village" as const, label: "Kijiji", placeholder: "Andika kijiji chako" },
  { name: "ward" as const, label: "Kata", placeholder: "Andika kata yako" },
];

export default function CitizenInformationStep({ control, isPending, onNext }: CitizenInformationStepProps) {
  return (
    <div className="space-y-8">
      <StepHeading icon={UserRound} title="Taarifa za mwananchi" description="Tafadhali jaza taarifa zako kwa usahihi ili kurahisisha mawasiliano." />
      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        {fields.map(({ name, label, placeholder, optional, type = "text" }) => (
          <FormField key={name} control={control} name={name} render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-800">{label} {optional && <span className="font-normal text-slate-400">(hiari)</span>}</FormLabel>
              <FormControl>
                <Input {...field} type={type} placeholder={placeholder} disabled={isPending} className="h-12 rounded-xl border-slate-300 bg-white focus-visible:ring-[#006b3c]" />
              </FormControl>
              {optional && <FormDescription>Unaweza kuacha sehemu hii wazi.</FormDescription>}
              <FormMessage />
            </FormItem>
          )} />
        ))}
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-6">
        <Button type="button" size="lg" className="min-w-36 bg-[#006b3c] px-6 hover:bg-[#005631]" disabled={isPending} onClick={onNext}>
          Endelea <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepHeading({ icon: Icon, title, description }: { icon: typeof UserRound; title: string; description: string }) {
  return <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900/10 text-[#006b3c]"><Icon className="h-6 w-6" /></div><div><h3 className="text-xl font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}
