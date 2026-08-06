"use client";

import { Check, CheckCircle2, ClipboardCopy, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FeedbackSuccessCardProps = { referenceNumber: string; onSubmitAnother: () => void };

export default function FeedbackSuccessCard({ referenceNumber, onSubmitAnother }: FeedbackSuccessCardProps) {
  const [copied, setCopied] = useState(false);
  async function copyReference() {
    try { await navigator.clipboard.writeText(referenceNumber); setCopied(true); toast.success("Namba ya kumbukumbu imenakiliwa."); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error("Imeshindwa kunakili namba ya kumbukumbu."); }
  }
  return <Card className="mx-auto max-w-2xl border border-emerald-900/15 bg-white shadow-xl shadow-emerald-950/5"><CardHeader className="items-center px-5 pt-8 text-center sm:px-8"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 className="h-9 w-9 text-[#006b3c]" /></div><CardTitle className="text-2xl text-slate-950">Taarifa imetumwa</CardTitle><CardDescription className="max-w-md leading-6">Asante kwa kushiriki. Hifadhi namba hii ya kumbukumbu ili uweze kufuatilia hatua za taarifa yako.</CardDescription></CardHeader><CardContent className="space-y-6 px-5 pb-8 sm:px-8"><div className="rounded-2xl border border-emerald-900/15 bg-emerald-50/70 p-5"><p className="text-sm font-medium text-slate-600">Namba ya kumbukumbu</p><div className="mt-2 flex items-center justify-between gap-3"><code className="text-base font-bold tracking-wider text-[#006b3c] sm:text-lg">{referenceNumber}</code><Button type="button" variant="outline" size="icon" className="border-emerald-900/20 bg-white" onClick={copyReference} aria-label="Nakili namba ya kumbukumbu">{copied ? <Check className="h-4 w-4 text-[#006b3c]" /> : <ClipboardCopy className="h-4 w-4" />}</Button></div></div><Button type="button" className="h-11 w-full bg-[#006b3c] hover:bg-[#005631]" onClick={onSubmitAnother}><Plus className="mr-2 h-4 w-4" /> Tuma taarifa nyingine</Button></CardContent></Card>;
}
