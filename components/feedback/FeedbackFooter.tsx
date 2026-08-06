import { Phone } from "lucide-react";

import { SITE } from "@/lib/constants/site";

export default function FeedbackFooter() {
  return (
    <aside className="mx-auto mt-8 flex max-w-4xl flex-col items-center gap-3 rounded-2xl border border-emerald-900/10 bg-white/70 px-5 py-5 text-center text-sm text-slate-600 sm:flex-row sm:text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-900/10 text-[#006b3c]">
        <Phone className="h-5 w-5" />
      </div>
      <p className="leading-6">
        Unahitaji msaada? Piga <a className="font-semibold text-[#006b3c] underline-offset-4 hover:underline" href={`tel:${SITE.phone}`}>{SITE.phone}</a> kuwasiliana na Halmashauri ya Wilaya ya Mlele.
      </p>
    </aside>
  );
}
