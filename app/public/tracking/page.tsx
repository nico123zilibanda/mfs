// app/public/tracking/page.tsx

import Image from "next/image";

import { ClipboardCheck } from "lucide-react";

import TrackingForm from "@/components/tracking/TrackingForm";
import Container from "@/components/layout/Container";

export default function TrackingPage() {
  return (
    <section
      className="
        min-h-[calc(100vh-18rem)]
        bg-slate-50
        py-16
        sm:py-24
        dark:bg-slate-950
      "
    >
      <Container>
        <div className="mx-auto max-w-2xl">

          <div className="flex flex-col items-center text-center">

            {/* National Logo */}
            <div
              className="
                relative
                flex
                h-28
                w-28
                items-center
                justify-center
                rounded-full
                border
                border-emerald-900/10
                bg-white
                shadow-xl
                ring-4
                ring-emerald-100
                dark:border-emerald-400/20
                dark:bg-slate-900
                dark:ring-emerald-900/40
              "
            >
              <Image
                src="/images/tanzania-logo.png"
                alt="Nembo ya Taifa"
                width={78}
                height={78}
                sizes="20"
                priority
                className="
                  object-contain
                "
              />
            </div>

            {/* Title Badge */}
            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-900/10
                bg-emerald-50
                px-4
                py-1.5
                text-sm
                font-semibold
                text-[#006b3c]
                dark:border-emerald-400/20
                dark:bg-emerald-950/40
                dark:text-emerald-400
              "
            >
              <ClipboardCheck className="h-4 w-4" />

              Ufuatiliaji wa Taarifa
            </div>


            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                leading-7
                text-slate-600
                dark:text-slate-400
              "
            >
              Weka namba ya kumbukumbu uliyopokea baada ya kutuma taarifa ili
              uone hatua iliyofikiwa.
            </p>

          </div>


          {/* Tracking Form Container */}
          <div
            className="
              mt-10
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-2
              shadow-xl
              shadow-emerald-950/5
              sm:p-6
              dark:border-slate-800
              dark:bg-slate-900
              dark:shadow-black/20
            "
          >
            <TrackingForm />
          </div>

        </div>
      </Container>
    </section>
  );
}