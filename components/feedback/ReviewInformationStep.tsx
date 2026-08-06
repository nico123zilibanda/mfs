"use client";

import { ArrowLeft, CheckCircle2, FileText, Send, UserRound } from "lucide-react";

import type { FeedbackInput } from "@/lib/schemas/feedback";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ReviewInformationStepProps {
  values: FeedbackInput;
  isPending: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ReviewInformationStep({ values, isPending, onBack, onSubmit }: ReviewInformationStepProps) {
  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900/10 text-[#006b3c]"><CheckCircle2 className="h-6 w-6" /></div><div><h3 className="text-xl font-bold text-slate-950">Hakiki taarifa zako</h3><p className="mt-1 text-sm leading-6 text-slate-500">Hakikisha taarifa zote ni sahihi kabla ya kuzituma.</p></div></div>
      <ReviewSection icon={UserRound} title="Taarifa za mwananchi">
        <div className="grid gap-5 sm:grid-cols-2"><ReviewItem label="Jina kamili" value={values.fullName || "Haijawekwa"} /><ReviewItem label="Namba ya simu" value={values.phone} /><ReviewItem label="Kijiji" value={values.village} /><ReviewItem label="Kata" value={values.ward} /></div>
      </ReviewSection>
      <ReviewSection icon={FileText} title="Taarifa ya tukio">
        <div className="space-y-5"><ReviewItem label="Maelezo ya tukio" value={values.corruptionDescription} /><ReviewItem label="Uliombwa rushwa?" value={values.hasBribeRequest ? "Ndiyo" : "Hapana"} /></div>
      </ReviewSection>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between"><Button type="button" variant="outline" size="lg" className="border-slate-300 px-6" disabled={isPending} onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> Rudi</Button><Button type="button" size="lg" className="bg-[#006b3c] px-6 hover:bg-[#005631]" disabled={isPending} onClick={onSubmit}>{isPending ? "Inatuma taarifa..." : <>Tuma taarifa <Send className="ml-1 h-4 w-4" /></>}</Button></div>
    </div>
  );
}

function ReviewSection({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6"><div className="flex items-center gap-3 text-slate-950"><Icon className="h-5 w-5 text-[#006b3c]" /><h4 className="font-bold">{title}</h4></div><Separator className="my-5 bg-slate-200" />{children}</section>;
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1.5 whitespace-pre-wrap leading-6 text-slate-900">{value}</p></div>;
}
