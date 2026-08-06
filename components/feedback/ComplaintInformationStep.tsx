"use client";

import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import type { Control } from "react-hook-form";

import type { FeedbackInput } from "@/lib/schemas/feedback";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface ComplaintInformationStepProps {
  control: Control<FeedbackInput>;
  isPending: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function ComplaintInformationStep({ control, isPending, onBack, onNext }: ComplaintInformationStepProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900/10 text-[#006b3c]"><FileText className="h-6 w-6" /></div><div><h3 className="text-xl font-bold text-slate-950">Taarifa ya tukio</h3><p className="mt-1 text-sm leading-6 text-slate-500">Eleza kwa undani tukio, eneo lilipotokea na taarifa nyingine muhimu.</p></div></div>
      <FormField control={control} name="corruptionDescription" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-800">Maelezo ya tukio</FormLabel>
          <FormControl><Textarea {...field} disabled={isPending} placeholder="Eleza kilichotokea, eneo lilipotokea na taarifa nyingine muhimu..." className="min-h-44 resize-y rounded-xl border-slate-300 bg-white leading-7 focus-visible:ring-[#006b3c]" /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control} name="hasBribeRequest" render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-800">Je, uliombwa kutoa rushwa?</FormLabel>
          <FormControl>
            <RadioGroup value={field.value ? "true" : "false"} onValueChange={(value) => field.onChange(value === "true")} disabled={isPending} className="grid gap-3 sm:grid-cols-2">
              <Choice value="true" selected={field.value} title="Ndiyo" description="Niliombwa kutoa rushwa." />
              <Choice value="false" selected={!field.value} title="Hapana" description="Sikuombwa kutoa rushwa." />
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" size="lg" className="border-slate-300 px-6" disabled={isPending} onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Rudi</Button>
        <Button type="button" size="lg" className="bg-[#006b3c] px-6 hover:bg-[#005631]" disabled={isPending} onClick={onNext}>Endelea <ArrowRight className="ml-1 h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function Choice({ value, selected, title, description }: { value: "true" | "false"; selected: boolean; title: string; description: string }) {
  return <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors", selected ? "border-[#006b3c] bg-emerald-50 ring-1 ring-[#006b3c]" : "border-slate-200 bg-white hover:border-emerald-800/40")}><RadioGroupItem value={value} className="mt-0.5" /><span><span className="block font-semibold text-slate-900">{title}</span><span className="mt-1 block text-sm text-slate-500">{description}</span></span></label>;
}
