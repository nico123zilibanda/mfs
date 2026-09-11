import Image from "next/image";

import { SITE } from "@/lib/constants/site";

export default function PublicBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3">

      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-white
          p-1
          ring-1
          ring-purple-200
          shadow-sm

          dark:bg-slate-100
          dark:ring-purple-800/40
        "
      >
        <Image
          src="/images/logo.jpeg"
          alt="Halmashauri ya Wilaya ya Mlele"
          width={56}
          height={56}
          sizes="20"
          priority
          className="rounded-full object-contain"
        />
      </div>

      <div className="min-w-0 leading-tight">

        <h1
          className="
            truncate
            text-sm
            font-bold
            tracking-tight
            text-slate-900
            sm:text-base

            dark:text-slate-100
          "
        >
          {SITE.council}
        </h1>

        <p
          className="
            mt-1
            truncate
            text-xs
            text-slate-500

            dark:text-slate-400
          "
        >
          Mfumo wa Maoni na Malalamiko ya Wananchi
        </p>

      </div>

    </div>
  );
}