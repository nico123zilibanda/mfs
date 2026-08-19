import { Phone } from "lucide-react";

import { SITE } from "@/lib/constants/site";


export default function FeedbackFooter() {

  return (

    <aside
      className="
        mx-auto
        mt-8
        flex
        max-w-4xl
        flex-col
        items-center
        gap-3

        rounded-2xl

        border
        border-emerald-900/10

        bg-white/70

        px-5
        py-5

        text-center
        text-sm

        text-slate-600

        backdrop-blur-sm

        sm:flex-row
        sm:text-left


        dark:border-emerald-400/20
        dark:bg-slate-900/70
        dark:text-slate-300
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center

          rounded-full

          bg-emerald-900/10

          text-[#006b3c]


          dark:bg-emerald-500/15
          dark:text-emerald-400
        "
      >

        <Phone
          className="
            h-5
            w-5
          "
        />

      </div>


      <p
        className="
          leading-6
        "
      >

        Unahitaji msaada? Piga{" "}

        <a
          href={`tel:${SITE.phone}`}
          className="
            font-semibold
            text-[#006b3c]
            underline-offset-4
            hover:underline

            dark:text-emerald-400
          "
        >
          {SITE.phone}
        </a>

        {" "}kuwasiliana na Halmashauri ya Wilaya ya Mlele.

      </p>


    </aside>

  );
}