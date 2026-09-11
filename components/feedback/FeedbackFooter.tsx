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
        border-purple-900/10

        bg-white/70

        px-5
        py-5

        text-center
        text-sm

        text-slate-600

        backdrop-blur-sm

        sm:flex-row
        sm:text-left


        dark:border-purple-400/20
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

          bg-purple-900/10

          text-[#6d28d9]


          dark:bg-purple-500/15
          dark:text-purple-400
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
            text-[#6d28d9]
            underline-offset-4
            hover:underline

            dark:text-purple-400
          "
        >
          {SITE.phone}
        </a>

        {" "}kuwasiliana na Halmashauri ya Wilaya ya Mlele.

      </p>


    </aside>

  );
}