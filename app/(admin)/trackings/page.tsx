// app/tracking/page.tsx

import TrackingForm from "@/components/tracking/TrackingForm";
import { SearchCheck } from "lucide-react";
export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#006b3c]"><SearchCheck className="h-6 w-6" /></div><h1 className="mt-5 text-2xl font-bold text-slate-950">Fuatilia taarifa</h1><p className="mt-2 text-sm leading-6 text-slate-500">Tumia namba ya kumbukumbu kuangalia hatua iliyofikiwa.</p></div>
        <div className="mt-6"><TrackingForm /></div>
      </div>
    </div>
  );
}
