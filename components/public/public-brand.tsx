import Image from "next/image";

import { SITE } from "@/lib/constants/site";

export default function PublicBrand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src="/images/mlele-logos.jpeg"
        alt="Halmashauri ya Wilaya ya Mlele"
        width={52}
        height={52}
        className="h-11 w-11 shrink-0 rounded-full border border-emerald-900/10 object-contain sm:h-13 sm:w-13"
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
          {SITE.council}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          Mfumo wa Maoni na Malalamiko ya Wananchi
        </p>
      </div>
    </div>
  );
}
