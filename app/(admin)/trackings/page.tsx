// app/tracking/page.tsx
import Image from "next/image";

import TrackingForm from "@/components/tracking/TrackingForm";
import { SearchCheck } from "lucide-react";
export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
                  <Image
                    src="/images/tanzania-logo.png"
                    alt="Nembo ya Taifa"
                    width={72}
                    height={72}
                    priority
                    className="object-contain"
                  />
                </div>
            <span className="mt-6 inline-flex rounded-full bg-emerald-900/10 px-4 py-1.5 text-sm font-semibold text-[#006b3c]">
              Ufuatiliaji wa Taarifa
            </span>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Weka namba ya kumbukumbu uliyopokea baada ya kutuma taarifa ili
              uone hatua iliyofikiwa.
            </p>
        </div>
        <div className="mt-6">
          <TrackingForm />
        </div>
      </div>
    </div>
  );
}
