// app/tracking/page.tsx

import TrackingForm from "@/components/tracking/TrackingForm";
import Container from "@/components/layout/Container";
import { ClipboardCheck } from "lucide-react";

export default function TrackingPage() {
  return (
    <section className="min-h-[calc(100vh-18rem)] bg-[#f7f8f5] py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900/10 text-[#006b3c]">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            <span className="mt-6 inline-flex rounded-full bg-emerald-900/10 px-4 py-1.5 text-sm font-semibold text-[#006b3c]">Ufuatiliaji wa Taarifa</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Fuatilia taarifa yako</h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">Weka namba ya kumbukumbu uliyopokea baada ya kutuma taarifa ili uone hatua iliyofikiwa.</p>
          </div>
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-emerald-950/5 sm:p-5">
            <TrackingForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
